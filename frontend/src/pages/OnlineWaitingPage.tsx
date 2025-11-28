import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import { Subject, QuestionType } from '../types/question.types';
import { io, Socket } from 'socket.io-client';
import api from '../utils/api';
import { HARDCODED_QUESTION_TYPES } from '../constants/questionTypes';

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

const OnlineWaitingPage: React.FC = () => {
  const navigate = useNavigate();
  const [playerName] = useState(() => sessionStorage.getItem('playerName') || 'لاعب');
  const [roomCode] = useState(() => sessionStorage.getItem('roomCode') || '');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Game configuration (read-only for players)
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [extraSauceEnabled, setExtraSauceEnabled] = useState(true);
  const [teams] = useState<Team[]>([
    { id: 'team-1', name: 'الفريق الأول', color: TEAM_COLORS[0] },
    { id: 'team-2', name: 'الفريق الثاني', color: TEAM_COLORS[1] },
  ]);
  const [joinedPlayers, setJoinedPlayers] = useState<JoinedPlayer[]>([]);
  
  // Safe array getters to prevent .map() errors
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeQuestionTypes = Array.isArray(questionTypes) ? questionTypes : [];
  const safeSelectedSubjects = Array.isArray(selectedSubjects) ? selectedSubjects : [];
  const safeSelectedTypes = Array.isArray(selectedTypes) ? selectedTypes : [];
  const safeTeams = Array.isArray(teams) ? teams : [];
  const safePlayers = Array.isArray(joinedPlayers) ? joinedPlayers : [];
  const [configLoaded, setConfigLoaded] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const playersRef = useRef<JoinedPlayer[]>([]); // Ref to track players independently
  const hasHadPlayersRef = useRef(false); // Track if we've ever had players

  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }
    
    console.log('🔵 [PLAYER] Component mounted/updated, roomCode:', roomCode);

    // Fetch subjects
    const fetchSubjects = async () => {
      try {
        const subjectsRes = await api.get('/subjects');
        // Map _id to id for consistency
        const mappedSubjects = subjectsRes.data.map((s: any) => ({
          ...s,
          id: s._id || s.id,
        }));
        setSubjects(mappedSubjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
    setQuestionTypes(HARDCODED_QUESTION_TYPES);

    // Connect to socket
    const socketUrl = (import.meta.env && import.meta.env.VITE_SOCKET_URL) || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('🔵 [PLAYER] Socket connected:', newSocket.id);
      setSocketConnected(true);
      // Join room with player name
      newSocket.emit('join-game', {
        gameId: roomCode.toUpperCase(),
        playerName: playerName,
        isHost: false,
      });
      console.log('🔵 [PLAYER] Emitted join-game with:', { gameId: roomCode.toUpperCase(), playerName, isHost: false });
      
      // Don't request config here - backend will handle it after delay
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔵 [PLAYER] Socket disconnected:', reason);
      setSocketConnected(false);
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔵 [PLAYER] Socket reconnected after', attemptNumber, 'attempts');
      setSocketConnected(true);
      // Re-join room
      newSocket.emit('join-game', {
        gameId: roomCode.toUpperCase(),
        playerName: playerName,
        isHost: false,
      });
    });

    // Listen for game config updates from host
    newSocket.on('game-config-updated', (config: any) => {
      try {
        console.log('🔵 [PLAYER] Received game config:', config);
        console.log('🔵 [PLAYER] Config players:', config.players);
        
        // Update non-player state first (these are safe)
        setSelectedSubjects(config.subjects || []);
        setSelectedTypes(config.questionTypes || []);
        setExtraSauceEnabled(config.extraSauceEnabled ?? true);
        
        // CRITICAL: Only update players if config has players AND it's not empty
        // Never overwrite with empty array - always merge or keep existing
        setJoinedPlayers((prev) => {
          try {
            // Update ref
            playersRef.current = prev;
            
            if (config.players && Array.isArray(config.players)) {
              if (config.players.length > 0) {
                console.log('🔵 [PLAYER] Config has players, merging:', config.players);
                hasHadPlayersRef.current = true; // Mark that we've had players
                // Merge: combine existing and new players, avoiding duplicates
                const merged = [...prev];
                config.players.forEach((newPlayer: JoinedPlayer) => {
                  if (!newPlayer || typeof newPlayer !== 'object') {
                    console.warn('🔵 [PLAYER] Invalid player data:', newPlayer);
                    return;
                  }
                  const exists = merged.some(p => 
                    (p.socketId && newPlayer.socketId && p.socketId === newPlayer.socketId) || 
                    (p.name && newPlayer.name && p.name === newPlayer.name)
                  );
                  if (!exists) {
                    merged.push(newPlayer);
                    console.log('🔵 [PLAYER] Added new player to merged list:', newPlayer.name);
                  }
                });
                playersRef.current = merged; // Update ref
                console.log('🔵 [PLAYER] Final merged players:', merged);
                return merged;
              } else {
                // Config has empty players array - NEVER clear if we've had players
                if (hasHadPlayersRef.current && prev.length > 0) {
                  console.log('🔵 [PLAYER] Config has EMPTY array but we have players - PROTECTING list:', prev);
                  return prev; // Protect existing players
                }
                console.log('🔵 [PLAYER] Config empty, no previous players, keeping empty');
                return prev;
              }
            } else {
              // No players in config - keep existing
              console.log('🔵 [PLAYER] No players in config, keeping current:', prev);
              return prev;
            }
          } catch (err) {
            console.error('❌ [PLAYER] Error in setJoinedPlayers:', err);
            return prev; // Return previous state on error
          }
        });
        setConfigLoaded(true);
      } catch (error) {
        console.error('❌ [PLAYER] Error updating game config:', error);
        // Don't crash - try to keep the page functional
      }
    });
    
    // Also listen for player-joined events (in case host sends them separately)
    newSocket.on('player-joined', (data: { socketId: string; playerName: string; isHost?: boolean }) => {
      try {
        console.log('🔵 [PLAYER] Player joined event received on waiting page:', data);
        // Don't process our own join event (we're already in the list via config)
        if (data.socketId === newSocket.id) {
          console.log('🔵 [PLAYER] Ignoring own join event');
          return;
        }
        if (!data.isHost) {
          setJoinedPlayers((prev) => {
            try {
              // Check if player already exists
              if (prev.some(p => p.socketId === data.socketId || p.name === data.playerName)) {
                console.log('🔵 [PLAYER] Player already in list, skipping');
                return prev;
              }
              const newPlayer = {
                id: `player-${Date.now()}-${Math.random()}`,
                name: data.playerName,
                teamId: null,
                socketId: data.socketId,
              };
              console.log('🔵 [PLAYER] Adding player from player-joined event:', newPlayer);
              hasHadPlayersRef.current = true; // Mark that we've had players
              const updated = [...prev, newPlayer];
              playersRef.current = updated; // Update ref
              return updated;
            } catch (err) {
              console.error('❌ [PLAYER] Error in player-joined setState:', err);
              return prev; // Return previous state on error
            }
          });
        }
      } catch (error) {
        console.error('❌ [PLAYER] Error handling player-joined event:', error);
      }
    });

    // Listen for game start
    newSocket.on('game-action', (data: any) => {
      if (data.action === 'start') {
        navigate('/online/game');
      }
    });

    setSocket(newSocket);

    return () => {
      console.log('🔵 [PLAYER] Component unmounting, disconnecting socket');
      newSocket.disconnect();
    };
  }, [roomCode, playerName, navigate]); // Keep dependencies minimal to avoid re-connections

  // Error boundary - if anything crashes, show error instead of blank screen
  if (!roomCode) {
    return (
      <WoodyBackground>
        <div className="min-h-screen p-4 flex items-center justify-center">
          <div className="text-white text-center">
            <p>خطأ: لا يوجد رمز غرفة</p>
            <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-blue-600 rounded">
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </WoodyBackground>
    );
  }

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (socket) socket.disconnect();
              navigate('/');
            }}
            className="text-white/70 hover:text-white"
          >
            ← مغادرة الغرفة
          </button>
          <h1 className="text-3xl font-bold text-white">انتظار بدء اللعبة</h1>
          <div className="w-16" />
        </div>

        {/* Player Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            مرحباً، {playerName}!
          </h2>
          <p className="text-white/70">
            رمز الغرفة: <span className="text-yellow-400 font-bold">{roomCode}</span>
          </p>
        </div>

        {!configLoaded ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="text-6xl mb-6 animate-pulse">⏳</div>
            <p className="text-white/80 mb-2">جاري تحميل إعدادات اللعبة...</p>
            <p className="text-white/50 text-sm">في انتظار المضيف</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Settings (Read-Only) */}
            <div className="space-y-6">
              {/* Subjects */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">المواضيع</h3>
                <div className="flex flex-wrap gap-2">
                  {safeSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`px-4 py-2 rounded-lg ${
                        safeSelectedSubjects.includes(subject.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/20 text-white/60 opacity-50'
                      }`}
                    >
                      {subject.nameAr}
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Types */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">أنواع الأسئلة</h3>
                <div className="flex flex-wrap gap-2">
                  {safeQuestionTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`px-4 py-2 rounded-lg ${
                        safeSelectedTypes.includes(type.id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/20 text-white/60 opacity-50'
                      }`}
                    >
                      {type.nameAr}
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Sauce */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center text-white">
                  <div className={`ml-3 w-5 h-5 rounded border-2 ${
                    extraSauceEnabled ? 'bg-green-500 border-green-500' : 'border-white/50'
                  }`}>
                    {extraSauceEnabled && '✓'}
                  </div>
                  <div>
                    <span className="font-bold">🌶️ الصلصة الإضافية</span>
                    <p className="text-white/60 text-sm">
                      {extraSauceEnabled ? 'مفعّل' : 'غير مفعّل'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Players & Teams */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              اللاعبون ({safePlayers.length})
            </h3>

            {!configLoaded ? (
              <div className="text-center py-8 text-white/50">
                جاري تحميل قائمة اللاعبين...
              </div>
            ) : safePlayers.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                في انتظار انضمام اللاعبين...
              </div>
            ) : (
              <div className="space-y-4">
                {safeTeams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-lg p-4"
                    style={{ backgroundColor: `${team.color}30` }}
                  >
                    <h4 className="text-white font-bold mb-2">{team.name}</h4>
                    <div className="min-h-[40px]">
                      {safePlayers
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
                {safePlayers.filter((p) => !p.teamId).length > 0 && (
                  <div className="text-white/60 text-sm">
                    بدون فريق:{' '}
                    {safePlayers
                      .filter((p) => !p.teamId)
                      .map((p) => p.name)
                      .join('، ')}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        )}

        {/* Waiting Message */}
        <div className="mt-8 bg-black/20 rounded-lg p-6 text-center">
          <p className="text-white/80 mb-2">
            في انتظار بدء اللعبة...
          </p>
          <p className="text-white/50 text-sm">
            سيبدأ المضيف اللعبة قريباً
          </p>
          {/* Debug info */}
          <div className="mt-4 text-xs text-white/30">
            Socket: {socketConnected ? '✅ متصل' : '❌ غير متصل'} | 
            Players: {safePlayers.length} | 
            Config: {configLoaded ? '✅' : '⏳'}
          </div>
        </div>
      </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineWaitingPage;
