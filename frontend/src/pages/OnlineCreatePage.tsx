import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Shared/Button';
import { Subject, QuestionType } from '../types/question.types';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import { HARDCODED_QUESTION_TYPES } from '../constants/questionTypes';
import api from '../utils/api';
import { io, Socket } from 'socket.io-client';

interface Team {
  id: string;
  name: string;
  color: string;
}

interface JoinedPlayer {
  id: string;
  name: string;
  teamId: string | null;
  socketId?: string;
}

const TEAM_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

const OnlineCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [roomLink, setRoomLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Game configuration
  const [teams] = useState<Team[]>([
    { id: 'team-1', name: 'الفريق الأول', color: TEAM_COLORS[0] },
    { id: 'team-2', name: 'الفريق الثاني', color: TEAM_COLORS[1] },
  ]);
  const [extraSauceEnabled, setExtraSauceEnabled] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Joined players
  const [joinedPlayers, setJoinedPlayers] = useState<JoinedPlayer[]>([]);

  useEffect(() => {
    // Generate room code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setRoomLink(`${window.location.origin}/online/join/${code}`);
    
    // Store room info
    sessionStorage.setItem('hostRoomCode', code);
    sessionStorage.setItem('isHost', 'true');
    console.log('Host room code:', code);
    
    // Fetch game data
    fetchGameData();
    
    // Connect to socket
    const socketUrl = (import.meta.env && import.meta.env.VITE_SOCKET_URL) || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Host connected to socket:', newSocket.id);
      // Join as host
      newSocket.emit('join-game', {
        gameId: code,
        playerName: 'المضيف',
        isHost: true,
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for players joining
    newSocket.on('player-joined', (data: { socketId: string; playerName: string; isHost?: boolean }) => {
      console.log('🟢 [HOST] Player joined event received:', data);
      // Don't add host to player list
      if (data.isHost) {
        console.log('🟢 [HOST] Ignoring host join event');
        return;
      }
      const newPlayer: JoinedPlayer = {
        id: `player-${Date.now()}-${Math.random()}`,
        name: data.playerName,
        teamId: null,
        socketId: data.socketId,
      };
      setJoinedPlayers((prev) => {
        console.log('🟢 [HOST] Current players before adding:', prev);
        // Check if player already exists
        if (prev.some(p => p.socketId === data.socketId || p.name === data.playerName)) {
          console.log('🟢 [HOST] Player already exists, skipping');
          return prev;
        }
        console.log('🟢 [HOST] Adding new player:', newPlayer);
        const updated = [...prev, newPlayer];
        console.log('🟢 [HOST] Updated players list:', updated);
        console.log('🟢 [HOST] Updated players count:', updated.length);
        // Broadcast updated player list to all players after state is updated
        // Use multiple timeouts to ensure state is definitely set
        setTimeout(() => {
          if (newSocket.connected) {
            // Get the latest state again to be absolutely sure
            setJoinedPlayers((latestPlayers) => {
              const config = {
                subjects: selectedSubjects,
                questionTypes: selectedTypes,
                extraSauceEnabled,
                teams,
                players: latestPlayers.length > 0 ? latestPlayers : updated, // Fallback to updated if latest is empty
              };
              console.log('🟢 [HOST] Broadcasting updated player list to all:', config.players);
              console.log('🟢 [HOST] Broadcasting player count:', config.players.length);
              newSocket.emit('update-game-config', config);
              return latestPlayers; // Don't change state
            });
          } else {
            console.error('🟢 [HOST] Socket not connected, cannot broadcast');
          }
        }, 500); // Increased delay significantly to ensure state is set
        return updated;
      });
    });

    // Listen for players leaving
    newSocket.on('player-left', (data: { socketId: string; playerName: string }) => {
      setJoinedPlayers((prev) => prev.filter(p => p.socketId !== data.socketId));
    });

    // Listen for config request from players
    newSocket.on('host-send-config', () => {
      console.log('🟡 [HOST] Received config request from player');
      // Use a function to get the latest state - but also add a small delay to ensure state is updated
      setTimeout(() => {
        setJoinedPlayers((currentPlayers) => {
          const config = {
            subjects: selectedSubjects,
            questionTypes: selectedTypes,
            extraSauceEnabled,
            teams,
            players: currentPlayers,
          };
          console.log('🟡 [HOST] Broadcasting config with players:', currentPlayers);
          console.log('🟡 [HOST] Player count:', currentPlayers.length);
          console.log('🟡 [HOST] Player names:', currentPlayers.map(p => p.name));
          if (newSocket.connected) {
            newSocket.emit('update-game-config', config);
            console.log('🟡 [HOST] Config emitted successfully');
          } else {
            console.error('🟡 [HOST] Socket not connected, cannot send config');
          }
          return currentPlayers; // Don't change state
        });
      }, 100); // Small delay to ensure player-joined handler has updated state
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

    // Broadcast config when settings change (but not when players change to avoid loops)
  useEffect(() => {
    if (socket && socket.connected && joinedPlayers.length >= 0) {
      // Use setTimeout to ensure we have the latest state
      setTimeout(() => {
        setJoinedPlayers((currentPlayers) => {
          const config = {
            subjects: selectedSubjects,
            questionTypes: selectedTypes,
            extraSauceEnabled,
            teams,
            players: currentPlayers,
          };
          console.log('Broadcasting config update with players:', currentPlayers);
          socket.emit('update-game-config', config);
          return currentPlayers; // Don't change state
        });
      }, 100);
    }
  }, [selectedSubjects, selectedTypes, extraSauceEnabled, socket]); // Removed joinedPlayers from deps

  const fetchGameData = async () => {
    // Question types are hardcoded
    setQuestionTypes(HARDCODED_QUESTION_TYPES);
    setSelectedTypes(HARDCODED_QUESTION_TYPES.map(t => t.id));
    
    try {
      const subjectsRes = await api.get('/subjects');
      setSubjects(subjectsRes.data);
      // Select all by default
      setSelectedSubjects(subjectsRes.data.map((s: Subject) => s.id));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Mock data
      const mockSubjects = [
        { id: '1', name: 'History', nameAr: 'التاريخ' },
        { id: '2', name: 'Science', nameAr: 'العلوم' },
        { id: '3', name: 'Sports', nameAr: 'الرياضة' },
        { id: '4', name: 'Geography', nameAr: 'الجغرافيا' },
      ];
      setSubjects(mockSubjects as Subject[]);
      setSelectedSubjects(mockSubjects.map(s => s.id));
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const startGame = () => {
    if (joinedPlayers.length < 2) {
      // For testing, add mock players
      const mockPlayers: JoinedPlayer[] = [
        { id: 'p1', name: 'لاعب 1', teamId: 'team-1' },
        { id: 'p2', name: 'لاعب 2', teamId: 'team-2' },
      ];
      setJoinedPlayers(mockPlayers);
    }

    const unassigned = joinedPlayers.filter((p) => !p.teamId);
    if (unassigned.length > 0 && joinedPlayers.length >= 2) {
      alert('يجب توزيع جميع اللاعبين على الفرق');
      return;
    }

    // Store game config
    const gameConfig = {
      mode: 'online',
      roomCode,
      teams: teams.map((t) => ({
        ...t,
        players: joinedPlayers.filter((p) => p.teamId === t.id),
        score: 0,
      })),
      settings: {
        extraSauceEnabled,
        selectedSubjects,
        selectedTypes,
      },
    };
    sessionStorage.setItem('gameConfig', JSON.stringify(gameConfig));
    
    // Notify all players that game is starting
    if (socket) {
      socket.emit('game-action', {
        gameId: roomCode,
        action: 'start',
        payload: gameConfig,
      });
    }
    
    navigate('/online/game');
  };

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white"
          >
            ← رجوع
          </button>
          <h1 className="text-3xl font-bold text-white">إنشاء غرفة</h1>
          <div className="w-16" />
        </div>

        {/* Room Link */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">شارك الرابط مع أصدقائك</h2>
          
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <div className="text-white/60 text-sm mb-1">رمز الغرفة:</div>
            <div className="text-4xl font-bold text-yellow-400 tracking-widest text-center">
              {roomCode}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={roomLink}
              readOnly
              className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white text-sm"
              dir="ltr"
            />
            <Button onClick={copyLink} variant={copied ? 'success' : 'primary'}>
              {copied ? 'تم النسخ!' : 'نسخ'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Game Settings */}
          <div className="space-y-6">
            {/* Subjects */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">المواضيع</h3>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => toggleSubject(subject.id)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedSubjects.includes(subject.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {subject.nameAr}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">أنواع الأسئلة</h3>
              <div className="flex flex-wrap gap-2">
                {questionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleType(type.id)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedTypes.includes(type.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {type.nameAr}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Sauce */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraSauceEnabled}
                  onChange={(e) => setExtraSauceEnabled(e.target.checked)}
                  className="ml-3 w-5 h-5"
                />
                <div>
                  <span className="font-bold">🌶️ الصلصة الإضافية</span>
                  <p className="text-white/60 text-sm">
                    قوى خارقة وصلصات سلبية لكل جولة
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Players & Teams */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              اللاعبون ({joinedPlayers.length})
            </h3>

            {joinedPlayers.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                في انتظار انضمام اللاعبين...
                <div className="mt-4 text-sm">
                  شارك الرابط أعلاه مع أصدقائك
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-lg p-4"
                    style={{ backgroundColor: `${team.color}30` }}
                  >
                    <h4 className="text-white font-bold mb-2">{team.name}</h4>
                    <div className="min-h-[40px]">
                      {joinedPlayers
                        .filter((p) => p.teamId === team.id)
                        .map((player) => (
                          <span
                            key={player.id}
                            className="inline-block bg-white/30 rounded px-2 py-1 text-white text-sm mr-2 mb-1"
                          >
                            {player.name}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}

                {/* Unassigned */}
                {joinedPlayers.filter((p) => !p.teamId).length > 0 && (
                  <div className="text-white/60 text-sm">
                    بدون فريق:{' '}
                    {joinedPlayers
                      .filter((p) => !p.teamId)
                      .map((p) => p.name)
                      .join('، ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={startGame}
            variant="success"
            size="lg"
            className="px-12"
          >
            ابدأ اللعبة 🚀
          </Button>
          <p className="text-white/50 text-sm mt-2">
            {joinedPlayers.length < 2
              ? 'سيتم إضافة لاعبين تجريبيين'
              : `${joinedPlayers.length} لاعبين جاهزين`}
          </p>
        </div>
      </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineCreatePage;
