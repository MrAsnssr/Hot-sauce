import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import { HARDCODED_QUESTION_TYPES } from '../constants/questionTypes';
import api from '../utils/api';
import { io, Socket } from 'socket.io-client';

// ============ TYPES ============
interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  players: string[];
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  points: number;
  timeLimit: number;
}

interface Subject {
  id: string;
  nameAr: string;
}

type GamePhase = 'pick_subject' | 'pick_type' | 'question' | 'results';

// ============ COMPONENT ============
const OnlineGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams<{ roomCode: string }>();

  // Game data
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [playerId, setPlayerId] = useState('');
  const [playerTeamId, setPlayerTeamId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [round, setRound] = useState(1);
  const [firstPickerIndex, setFirstPickerIndex] = useState(0); // Which team picks first
  const [firstPickIsSubject, setFirstPickIsSubject] = useState(true); // Whether first pick is subject or type

  // Current round state
  const [phase, setPhase] = useState<GamePhase>('pick_subject');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Voting state
  const [playerVotes, setPlayerVotes] = useState<Record<string, string>>({}); // {playerId: optionId}
  const [teamAnswers, setTeamAnswers] = useState<Record<string, { optionId: string; timestamp: number }>>({});
  const [timer, setTimer] = useState(30);
  const [socket, setSocket] = useState<Socket | null>(null);

  // ============ INIT ============
  useEffect(() => {
    // 1. Resolve Room Code
    const code = urlRoomCode?.toUpperCase() || sessionStorage.getItem('roomCode') || '';
    
    if (!code) {
      navigate('/');
      return;
    }
    setRoomCode(code);

    // 2. Resolve Player Info
    const host = sessionStorage.getItem('isHost') === 'true';
    setIsHost(host);
    const pId = sessionStorage.getItem('playerName') || `player-${Date.now()}`;
    setPlayerId(pId);

    // 3. Load Initial Game Data (if available locally, will be overwritten by socket)
    const gameData = sessionStorage.getItem('onlineGame');
    if (gameData) {
      try {
        const parsed = JSON.parse(gameData);
        // Only use session data if it matches current room
        if (parsed.roomCode === code) {
          if (parsed.teams) {
             setTeams(parsed.teams.map((t: any) => ({ ...t, score: 0 })));
             
             // Find player team
             const playerTeam = parsed.teams.find((t: any) => 
               t.players?.some((p: any) => p.name === pId || p.id === pId)
             );
             if (playerTeam) {
               setPlayerTeamId(playerTeam.id);
             }
          }
        }
      } catch (e) {
        console.error('Error parsing local game data', e);
      }
    }

    loadSubjects();
    const newSocket = setupSocket(code, pId, host);

    return () => {
      if (newSocket && newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, [navigate, urlRoomCode]);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      const data = Array.isArray(res.data) ? res.data : (res.data?.subjects ? res.data.subjects : []);
      setSubjects(data.map((s: any) => ({
        id: s._id || s.id,
        nameAr: s.nameAr || s.name,
      })));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([{ id: '1', nameAr: 'ثقافة عامة' }]);
    }
  };

  const setupSocket = (code: string, pId: string, host: boolean) => {
    const socketUrl = import.meta.env?.VITE_SOCKET_URL || 
                     (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://hot-sauce.onrender.com');
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to game socket');
      newSocket.emit('join-game', {
        gameId: code,
        playerName: pId,
        isHost: host,
      });
      
      // If host, we might want to ensure the game is started or send config
      // But typically this is handled in the lobby. 
      // If refresh happens, the backend should hopefully have state.
      // If backend has no state (server restart), we might need to re-send config from session.
      if (host) {
        const gameData = sessionStorage.getItem('onlineGame');
        if (gameData) {
           try {
             const parsed = JSON.parse(gameData);
             if (parsed.teams && parsed.roomCode === code) {
               // Re-sync teams if backend lost them
               newSocket.emit('update-game-config', { teams: parsed.teams });
             }
           } catch(e) {}
        }
      }
    });

    newSocket.on('game-started', (data: { teams: Team[]; firstPickerIndex?: number; firstPickIsSubject?: boolean }) => {
      // This might happen if late joiner or re-sync
      if (data.teams) {
        setTeams(data.teams);
        // Recalculate my team
        const playerTeam = data.teams.find((t: any) => 
            t.players?.some((p: any) => p.name === pId || p.id === pId)
        );
        if (playerTeam) setPlayerTeamId(playerTeam.id);
      }
      // Initialize picker state
      if (data.firstPickerIndex !== undefined) {
        setFirstPickerIndex(data.firstPickerIndex);
      }
      if (data.firstPickIsSubject !== undefined) {
        setFirstPickIsSubject(data.firstPickIsSubject);
        // Set initial phase based on what the first picker picks
        setPhase(data.firstPickIsSubject ? 'pick_subject' : 'pick_type');
      }
    });

    // Handle receiving config update (e.g. from lobby or re-sync)
    newSocket.on('game-config-updated', (config: any) => {
      if (config.teams) {
        setTeams(config.teams);
        const playerTeam = config.teams.find((t: any) => 
            t.players?.some((p: any) => p.name === pId || p.id === pId)
        );
        if (playerTeam) setPlayerTeamId(playerTeam.id);
      }
    });

    newSocket.on('game-phase-changed', (data: { phase: GamePhase }) => {
      setPhase(data.phase);
    });

    newSocket.on('question-loaded', (data: { question: any }) => {
      const q = data.question;
      let options: QuestionOption[] = [];
      if (q.options?.length > 0) {
        options = q.options.map((o: any, i: number) => ({
          id: o.id || o._id || `${i}`,
          text: o.text,
          isCorrect: o.isCorrect === true,
        }));
      } else if (q.correctAnswer) {
        options = shuffleArray([
          { id: 'correct', text: q.correctAnswer, isCorrect: true },
          { id: 'w1', text: 'خيار خاطئ ١', isCorrect: false },
          { id: 'w2', text: 'خيار خاطئ ٢', isCorrect: false },
          { id: 'w3', text: 'خيار خاطئ ٣', isCorrect: false },
        ]);
      }

      setCurrentQuestion({
        id: q._id || q.id || Date.now().toString(),
        text: q.text,
        options,
        points: q.points || 10,
        timeLimit: q.timeLimit || 30,
      });
      setTimer(q.timeLimit || 30);
      setPlayerVotes({});
      setTeamAnswers({});
      setPhase('question');
    });

    newSocket.on('vote-updated', (data: { teamId: string; votes: Record<string, string> }) => {
      setPlayerVotes(prev => {
        // Only update if it's relevant (my team, or if we want to show all votes?)
        // Currently we only track my team's votes in local state for logic, 
        // but let's just merge. Logic uses playerTeamId to filter display.
        return { ...prev, ...data.votes };
      });
    });

    newSocket.on('team-answer-locked', (data: { teamId: string; optionId: string; timestamp: number }) => {
      setTeamAnswers(prev => ({
        ...prev,
        [data.teamId]: { optionId: data.optionId, timestamp: data.timestamp },
      }));
    });

    newSocket.on('results-revealed', (data: { 
      teamAnswers: Record<string, { optionId: string; timestamp: number }>;
      scores: Record<string, number>;
    }) => {
      setTeamAnswers(data.teamAnswers);
      setTeams(prev => prev.map(t => ({
        ...t,
        score: data.scores[t.id] || t.score,
      })));
      setPhase('results');
    });

    newSocket.on('round-ended', (data: { subjectPickerTeamId?: string; teams?: Team[]; firstPickerIndex?: number; firstPickIsSubject?: boolean }) => {
      // Update teams if provided
      if (data.teams) {
        setTeams(data.teams);
      }
      
      // Update picker state from backend if provided, otherwise rotate locally
      if (data.firstPickerIndex !== undefined && data.firstPickIsSubject !== undefined) {
        setFirstPickerIndex(data.firstPickerIndex);
        setFirstPickIsSubject(data.firstPickIsSubject);
      } else {
        // Rotate: alternate both the team and what they pick
        setFirstPickerIndex(prev => {
          const next = (prev + 1) % (data.teams?.length || teams.length || 2);
          if (next === 0) setRound(r => r + 1);
          return next;
        });
        setFirstPickIsSubject(prev => !prev); // Alternate subject/type
      }
      
      setSelectedSubject(null);
      setSelectedType(null);
      setCurrentQuestion(null);
      setPlayerVotes({});
      setTeamAnswers({});
      // Set phase based on what the first picker picks
      const firstPickIsSubj = data.firstPickIsSubject !== undefined ? data.firstPickIsSubject : !firstPickIsSubject;
      setPhase(firstPickIsSubj ? 'pick_subject' : 'pick_type');
    });
    
    setSocket(newSocket);
    return newSocket;
  };

  // ============ TIMER ============
  useEffect(() => {
    if (phase !== 'question' || timer <= 0) return;
    
    let intervalId: ReturnType<typeof setInterval>;
    let mounted = true;
    
    intervalId = setInterval(() => {
      if (!mounted) return;
      
      setTimer(t => {
        if (t <= 1) {
          if (mounted && socket && isHost) {
            socket.emit('reveal-results', { gameId: roomCode });
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [phase, socket, isHost, roomCode]);

  // ============ GAME LOGIC ============
  // Determine which team picks what based on firstPickerIndex and firstPickIsSubject
  const secondPickerIndex = (firstPickerIndex + 1) % teams.length;
  const subjectPickerIndex = firstPickIsSubject ? firstPickerIndex : secondPickerIndex;
  const typePickerIndex = firstPickIsSubject ? secondPickerIndex : firstPickerIndex;
  
  const subjectPickerTeam = teams[subjectPickerIndex];
  const typePickerTeam = teams[typePickerIndex];

  const handleSelectSubject = (subjectId: string) => {
    // Only allow if host AND host's team is the subject picker team
    if (!isHost || phase !== 'pick_subject' || !playerTeamId || playerTeamId !== subjectPickerTeam?.id) return;
    setSelectedSubject(subjectId);
    if (socket) {
      socket.emit('select-subject', { gameId: roomCode, subjectId });
      // If subject was picked first, now move to type picking
      if (firstPickIsSubject) {
        socket.emit('game-phase-changed', { gameId: roomCode, phase: 'pick_type' });
        setPhase('pick_type');
      } else {
        // If type was picked first (we're picking subject second), now we have both - load question
        if (selectedType) {
          socket.emit('load-question', { gameId: roomCode, subjectId, typeId: selectedType });
        } else {
          // This shouldn't happen, but just in case
          console.warn('Type not selected yet, but subject was picked second');
        }
      }
    }
  };

  const handleSelectType = (typeId: string) => {
    // Only allow if host AND host's team is the type picker team
    if (!isHost || phase !== 'pick_type' || !playerTeamId || playerTeamId !== typePickerTeam?.id) return;
    setSelectedType(typeId);
    if (socket) {
      socket.emit('select-type', { gameId: roomCode, typeId });
      // If type was picked first, now move to subject picking
      if (!firstPickIsSubject) {
        socket.emit('game-phase-changed', { gameId: roomCode, phase: 'pick_subject' });
        setPhase('pick_subject');
      } else {
        // If subject was picked first (we're picking type second), now we have both - load question
        if (selectedSubject) {
          socket.emit('load-question', { gameId: roomCode, subjectId: selectedSubject, typeId });
        } else {
          // This shouldn't happen, but just in case
          console.warn('Subject not selected yet, but type was picked second');
        }
      }
    }
  };

  const handleVote = (optionId: string) => {
    if (!playerTeamId || phase !== 'question' || !socket) return;
    
    // Prevent duplicate votes
    if (playerVotes[playerId] === optionId) return;
    
    socket.emit('player-vote', {
      gameId: roomCode,
      teamId: playerTeamId,
      playerId: playerId,
      optionId,
    });
    setPlayerVotes(prev => ({ ...prev, [playerId]: optionId }));
  };

  const handleRevealResults = () => {
    if (!isHost || phase !== 'question') return;
    if (socket) {
      socket.emit('reveal-results', { gameId: roomCode });
    }
  };

  const handleNextRound = () => {
    if (!isHost || phase !== 'results') return;
    if (socket) {
      socket.emit('round-ended', { gameId: roomCode });
    }
  };

  // Calculate team's answer from votes
  const getTeamAnswer = (teamId: string): string | null => {
    if (teamAnswers[teamId]) {
      return teamAnswers[teamId].optionId;
    }
    // Calculate from votes (majority, or first if tie)
    if (!playerTeamId || teamId !== playerTeamId) return null;
    
    const voteCounts: Record<string, number> = {};
    Object.values(playerVotes).forEach(optId => {
      if (optId) {
        voteCounts[optId] = (voteCounts[optId] || 0) + 1;
      }
    });
    
    const voteValues = Object.values(voteCounts);
    if (voteValues.length === 0) return null;
    
    const maxVotes = Math.max(...voteValues);
    const winners = Object.keys(voteCounts).filter(opt => voteCounts[opt] === maxVotes);
    
    // First player breaks tie
    if (winners.length > 1) {
      const firstVote = Object.entries(playerVotes).find(([pid, optId]) => optId && winners.includes(optId));
      return firstVote ? firstVote[1] : winners[0];
    }
    
    return winners[0] || null;
  };

  const myVote = playerVotes[playerId];
  const myTeamAnswer = playerTeamId ? getTeamAnswer(playerTeamId) : null;

  // ============ HELPERS ============
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ============ RENDER ============
  if (teams.length === 0) {
    return (
      <WoodyBackground>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white text-2xl">جاري التحميل...</p>
        </div>
      </WoodyBackground>
    );
  }

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                if (confirm('إنهاء اللعبة؟')) {
                  sessionStorage.removeItem('onlineGame');
                  sessionStorage.removeItem('roomCode');
                  sessionStorage.removeItem('isHost');
                  navigate('/');
                }
              }}
              className="text-white/60 hover:text-white"
            >
              ✕ خروج
            </button>
            <div className="text-white">
              <span className="text-yellow-400 font-bold">{roomCode}</span>
              <span className="text-white/60 mr-2"> | الجولة {round}</span>
            </div>
            <div className="w-16" />
          </div>

          {/* Scoreboard */}
          <div className="flex justify-center gap-6 mb-6">
            {teams.map((team, i) => {
              const isPicking = (phase === 'pick_subject' && i === subjectPickerIndex) || 
                                (phase === 'pick_type' && i === typePickerIndex);
              return (
                <div
                  key={team.id}
                  className={`rounded-xl px-6 py-4 text-center min-w-[140px] ${
                    isPicking ? 'ring-4 ring-yellow-400 scale-105' : ''
                  }`}
                  style={{ backgroundColor: team.color }}
                >
                  <div className="text-white font-bold">{team.name}</div>
                  <div className="text-4xl font-bold text-white">{team.score}</div>
                </div>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            
            {/* PICK SUBJECT */}
            {phase === 'pick_subject' && (
              <>
                <div className="text-center mb-6">
                  <span className="text-white text-xl">
                    <strong style={{ color: subjectPickerTeam?.color }}>{subjectPickerTeam?.name}</strong> يختار الموضوع
                  </span>
                </div>
                
                {isHost && playerTeamId === subjectPickerTeam?.id ? (
                  <div className="flex flex-wrap justify-center gap-4">
                    {subjects.map(subject => (
                      <button
                        key={subject.id}
                        onClick={() => handleSelectSubject(subject.id)}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-6 py-4 text-lg font-bold transition-transform hover:scale-105"
                      >
                        {subject.nameAr}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-white text-xl">في انتظار {subjectPickerTeam?.name} لاختيار الموضوع...</p>
                  </div>
                )}
              </>
            )}

            {/* PICK TYPE */}
            {phase === 'pick_type' && (
              <>
                <div className="text-center mb-6">
                  <span className="text-white text-xl">
                    <strong style={{ color: typePickerTeam?.color }}>{typePickerTeam?.name}</strong> يختار نوع السؤال
                  </span>
                  {selectedSubject && (
                    <p className="text-white/60 text-sm mt-2">
                      الموضوع: {subjects.find(s => s.id === selectedSubject)?.nameAr}
                    </p>
                  )}
                </div>
                
                {isHost && playerTeamId === typePickerTeam?.id ? (
                  <div className="flex flex-wrap justify-center gap-4">
                    {HARDCODED_QUESTION_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handleSelectType(type.id)}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-6 py-4 text-lg font-bold transition-transform hover:scale-105 min-w-[160px]"
                      >
                        <div>{type.nameAr}</div>
                        <div className="text-sm text-white/70">{type.description}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-white text-xl">في انتظار {typePickerTeam?.name} لاختيار نوع السؤال...</p>
                  </div>
                )}
              </>
            )}

            {/* QUESTION */}
            {phase === 'question' && currentQuestion && (
              <>
                {/* Timer */}
                <div className="text-center mb-4">
                  <span className={`text-4xl font-bold ${timer <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timer}
                  </span>
                </div>

                {/* Question */}
                <h2 className="text-2xl font-bold text-white text-center mb-8">
                  {currentQuestion.text}
                </h2>

                {/* Voting (only show if player is on a team) */}
                {playerTeamId && (
                  <div className="mb-6">
                    <div
                      className="text-center py-2 rounded-lg mb-3"
                      style={{ backgroundColor: `${teams.find(t => t.id === playerTeamId)?.color}60` }}
                    >
                      <span className="text-white font-bold">فريقك: {teams.find(t => t.id === playerTeamId)?.name}</span>
                      {myTeamAnswer && <span className="text-green-300 mr-2"> ✓ تم الإغلاق</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options.map(opt => {
                        const selected = myVote === opt.id;
                        const locked = !!myTeamAnswer;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleVote(opt.id)}
                            disabled={locked}
                            className={`p-4 rounded-xl text-white text-lg transition-all ${
                              selected ? 'bg-blue-600 ring-4 ring-blue-400' :
                              locked ? 'bg-white/10 opacity-50 cursor-not-allowed' :
                              'bg-white/20 hover:bg-white/30'
                            }`}
                          >
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                    
                    {myVote && !myTeamAnswer && (
                      <p className="text-white/60 text-sm text-center mt-2">
                        صوتك: {currentQuestion.options.find(o => o.id === myVote)?.text}
                      </p>
                    )}
                  </div>
                )}

                {/* Show Results Button (Host only) */}
                {isHost && (
                  <div className="text-center mt-4">
                    <button
                      onClick={handleRevealResults}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-xl font-bold"
                    >
                      كشف الإجابة
                    </button>
                  </div>
                )}
              </>
            )}

            {/* RESULTS */}
            {phase === 'results' && currentQuestion && (
              <>
                <h2 className="text-2xl font-bold text-white text-center mb-4">
                  {currentQuestion.text}
                </h2>

                {/* Correct Answer */}
                <div className="bg-green-600/30 border-2 border-green-500 rounded-xl p-4 mb-6 text-center">
                  <p className="text-green-400 text-sm">الإجابة الصحيحة:</p>
                  <p className="text-white text-xl font-bold">
                    {currentQuestion.options.find(o => o.isCorrect)?.text}
                  </p>
                </div>

                {/* Team Results */}
                {teams.map(team => {
                  const answer = teamAnswers[team.id];
                  const selected = answer ? currentQuestion.options?.find(o => o.id === answer.optionId) : null;
                  const correct = selected?.isCorrect;
                  const isFaster = answer && correct && Object.values(teamAnswers).some(a => 
                    a && a.timestamp < answer.timestamp && 
                    currentQuestion.options?.find(o => o.id === a.optionId)?.isCorrect
                  );
                  
                  return (
                    <div
                      key={team.id}
                      className={`mb-3 p-4 rounded-xl ${correct ? 'bg-green-600/30' : 'bg-red-600/30'}`}
                    >
                      <div className="flex justify-between">
                        <span className="text-white font-bold">{team.name}</span>
                        <span className={correct ? 'text-green-400' : 'text-red-400'}>
                          {!answer ? 'لم يجب ❌' : 
                           correct ? `صحيح ✓ +${currentQuestion.points}${isFaster ? ' (أسرع +5)' : ''}` : 
                           'خطأ ❌'}
                        </span>
                      </div>
                      {answer && (
                        <p className="text-white/60 text-sm">اختار: {selected?.text}</p>
                      )}
                    </div>
                  );
                })}

                {/* Next Round Button (Host only) */}
                {isHost && (
                  <div className="text-center mt-6">
                    <button
                      onClick={handleNextRound}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-xl font-bold"
                    >
                      الجولة التالية ←
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineGamePage;
