import React, { useState, useEffect } from 'react';
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
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // Fetch subjects
    const fetchSubjects = async () => {
      try {
        const subjectsRes = await api.get('/subjects');
        setSubjects(subjectsRes.data);
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
      console.log('Player connected to socket:', newSocket.id);
      // Join room with player name
      newSocket.emit('join-game', {
        gameId: roomCode.toUpperCase(),
        playerName: playerName,
        isHost: false,
      });
      console.log('Emitted join-game with:', { gameId: roomCode.toUpperCase(), playerName, isHost: false });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for game config updates from host
    newSocket.on('game-config-updated', (config: any) => {
      setSelectedSubjects(config.subjects || []);
      setSelectedTypes(config.questionTypes || []);
      setExtraSauceEnabled(config.extraSauceEnabled ?? true);
      setJoinedPlayers(config.players || []);
      setConfigLoaded(true);
    });

    // Request config when connected
    newSocket.on('connect', () => {
      setTimeout(() => {
        newSocket.emit('request-game-config');
      }, 500);
    });

    // Listen for game start
    newSocket.on('game-action', (data: any) => {
      if (data.action === 'start') {
        navigate('/online/game');
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, playerName, navigate]);

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
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`px-4 py-2 rounded-lg ${
                        selectedSubjects.includes(subject.id)
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
                  {questionTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`px-4 py-2 rounded-lg ${
                        selectedTypes.includes(type.id)
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
                اللاعبون ({joinedPlayers.length})
              </h3>

              {joinedPlayers.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  في انتظار انضمام اللاعبين...
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
        )}

        {/* Waiting Message */}
        <div className="mt-8 bg-black/20 rounded-lg p-6 text-center">
          <p className="text-white/80 mb-2">
            في انتظار بدء اللعبة...
          </p>
          <p className="text-white/50 text-sm">
            سيبدأ المضيف اللعبة قريباً
          </p>
        </div>
      </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineWaitingPage;
