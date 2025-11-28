import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WoodyBackground } from '../components/Shared/WoodyBackground';
import { Button } from '../components/Shared/Button';
import api from '../utils/api';
import { io, Socket } from 'socket.io-client';

const TEAM_COLORS = ['#3b82f6', '#ef4444'];

interface Subject {
  id: string;
  nameAr: string;
}

interface Player {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
}

const OnlineCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams<{ roomCode: string }>();
  
  // Room setup
  const [roomCode, setRoomCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Settings Mode
  const [showSettings, setShowSettings] = useState(false);
  
  // Teams
  const [team1Name, setTeam1Name] = useState('الفريق الأزرق');
  const [team2Name, setTeam2Name] = useState('الفريق الأحمر');
  
  // Settings Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // Players
  const [players, setPlayers] = useState<Player[]>([]);
  const [hostName, setHostName] = useState(() => sessionStorage.getItem('playerName') || 'المضيف');

  // Initialize Room
  useEffect(() => {
    // 1. Handle Room Code
    let currentCode = urlRoomCode;
    if (!currentCode) {
      // Check session storage or generate new
      currentCode = sessionStorage.getItem('roomCode') || Math.random().toString(36).substring(2, 8).toUpperCase();
      // Update URL without reload
      navigate(`/online/lobby/${currentCode}`, { replace: true });
    } else {
      currentCode = currentCode.toUpperCase();
    }
    
    setRoomCode(currentCode);
    sessionStorage.setItem('roomCode', currentCode);
    sessionStorage.setItem('isHost', 'true');
    sessionStorage.setItem('playerName', hostName);

    // 2. Load Subjects
    loadSubjects();

    // 3. Connect Socket
    const socketUrl = import.meta.env?.VITE_SOCKET_URL || 
                     (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://hot-sauce.onrender.com');
    
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Host connected to socket');
      
      // Join as host
      newSocket.emit('join-game', {
        gameId: currentCode,
        playerName: hostName,
        isHost: true,
      });

      // Add self to players list immediately
      setPlayers(prev => {
        if (prev.some(p => p.isHost)) return prev;
        return [...prev, { id: 'host', name: hostName, socketId: newSocket.id || 'host', isHost: true }];
      });
    });

    // Listen for players joining
    newSocket.on('player-joined', (data: { socketId: string, playerName: string, isHost: boolean }) => {
      console.log('👋 Player joined:', data);
      setPlayers(prev => {
        // Avoid duplicates
        if (prev.some(p => p.socketId === data.socketId || p.name === data.playerName)) return prev;
        return [...prev, { 
          id: data.socketId, 
          name: data.playerName, 
          socketId: data.socketId, 
          isHost: data.isHost 
        }];
      });
    });

    // Listen for players leaving
    newSocket.on('player-left', (data: { socketId: string, playerName: string }) => {
      console.log('👋 Player left:', data);
      setPlayers(prev => prev.filter(p => p.socketId !== data.socketId));
    });

    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, [navigate, urlRoomCode, hostName]); // Re-run if URL code changes (shouldn't happen often)

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      const data = Array.isArray(res.data) ? res.data : 
                   (res.data?.subjects ? res.data.subjects : []);
      
      const mapped = data.map((s: any) => ({
        id: s._id || s.id,
        nameAr: s.nameAr || s.name,
      }));
      setSubjects(mapped);
      setSelectedSubjects(mapped.map((s: Subject) => s.id));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([{ id: '1', nameAr: 'ثقافة عامة' }]);
      setSelectedSubjects(['1']);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/online/join/${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleStartGame = () => {
    if (!socket) return;

    // Distribute players to teams (simple round-robin for now)
    // Host is usually in Team 1 or spectator, but let's assign everyone
    const team1Players: any[] = [];
    const team2Players: any[] = [];
    
    players.forEach((p, i) => {
      if (i % 2 === 0) team1Players.push({ id: p.socketId, name: p.name });
      else team2Players.push({ id: p.socketId, name: p.name });
    });

    const teams = [
      { id: 'team-1', name: team1Name, color: TEAM_COLORS[0], score: 0, players: team1Players },
      { id: 'team-2', name: team2Name, color: TEAM_COLORS[1], score: 0, players: team2Players },
    ];

    const gameConfig = {
      roomCode,
      isHost: true,
      teams,
      selectedSubjects,
      players: players.map(p => ({ id: p.socketId, name: p.name })),
    };
    
    // Save to session for persistence
    sessionStorage.setItem('onlineGame', JSON.stringify(gameConfig));
    
    // Emit start game event
    socket.emit('update-game-config', gameConfig); // Notify backend of teams
    socket.emit('start-game', {
      gameId: roomCode,
      teams,
    });
    
    navigate(`/online/game/${roomCode}`);
  };

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate('/')} className="text-white/70 hover:text-white">
              ← خروج
            </button>
            <h1 className="text-3xl font-bold text-white">لوبي اللعبة</h1>
            <div className="w-16" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Room Info & Actions */}
            <div className="space-y-6">
              
              {/* Join Link Card */}
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <p className="text-white/60 mb-2">رابط الانضمام</p>
                <div className="text-4xl font-bold text-yellow-400 tracking-widest mb-4 font-mono">
                  {roomCode}
                </div>
                <button
                  onClick={copyLink}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copied ? '✓ تم النسخ!' : '📋 نسخ الرابط'}
                </button>
                <p className="text-white/40 text-xs mt-3">
                  شارك هذا الرمز أو الرابط مع اللاعبين للانضمام
                </p>
              </div>

              {/* Game Settings Trigger */}
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span>⚙️ إعدادات اللعبة</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>الفرق:</span>
                    <span>{team1Name} vs {team2Name}</span>
                  </div>
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>المواضيع:</span>
                    <span>{selectedSubjects.length} مختارة</span>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="w-full mt-4"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    {showSettings ? 'إخفاء الإعدادات' : 'تعديل الإعدادات'}
                  </Button>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartGame}
                disabled={players.length < 1} // Allow starting with 1 player for testing
                className={`w-full py-4 rounded-xl text-2xl font-bold shadow-lg transition-all transform hover:scale-105 ${
                  players.length < 1
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                🚀 ابدأ اللعبة
              </button>
              {players.length < 2 && (
                <p className="text-center text-yellow-400/80 text-sm">
                  💡 يفضل وجود لاعبين على الأقل
                </p>
              )}
            </div>

            {/* Right Column: Player List */}
            <div className="bg-white/10 rounded-xl p-6 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  اللاعبون المتصلون ({players.length})
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-white/60 text-sm">مباشر</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {players.length === 0 ? (
                  <div className="text-center py-12 opacity-50">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-white">في انتظار انضمام اللاعبين...</p>
                  </div>
                ) : (
                  players.map((player, idx) => (
                    <div
                      key={player.id}
                      className="bg-white/20 rounded-lg p-3 flex items-center justify-between animate-fadeIn"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          idx % 2 === 0 ? 'bg-blue-500' : 'bg-red-500'
                        } text-white`}>
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">
                          {player.name} {player.isHost && '(أنت)'}
                        </span>
                      </div>
                      <span className="text-white/40 text-xs">
                        {idx % 2 === 0 ? 'الفريق 1' : 'الفريق 2'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Settings Modal/Section Overlay */}
          {showSettings && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">إعدادات اللعبة</h2>
                  <button onClick={() => setShowSettings(false)} className="text-white/60 hover:text-white">✕</button>
                </div>

                <div className="space-y-6">
                  {/* Team Names */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm block mb-2">اسم الفريق الأول (الأزرق)</label>
                      <input
                        type="text"
                        value={team1Name}
                        onChange={(e) => setTeam1Name(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-blue-900/40 text-white border border-blue-500/50 focus:border-blue-500"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm block mb-2">اسم الفريق الثاني (الأحمر)</label>
                      <input
                        type="text"
                        value={team2Name}
                        onChange={(e) => setTeam2Name(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-red-900/40 text-white border border-red-500/50 focus:border-red-500"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-white/60 text-sm">المواضيع</label>
                      <button 
                        onClick={() => setSelectedSubjects(subjects.map(s => s.id))}
                        className="text-blue-400 text-xs hover:text-blue-300"
                      >
                        تحديد الكل
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map(subject => (
                        <button
                          key={subject.id}
                          onClick={() => toggleSubject(subject.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            selectedSubjects.includes(subject.id)
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                        >
                          {subject.nameAr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => setShowSettings(false)}>
                      حفظ وإغلاق
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </WoodyBackground>
  );
};

export default OnlineCreatePage;
