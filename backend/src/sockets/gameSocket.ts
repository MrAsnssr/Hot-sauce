import { Server, Socket } from 'socket.io';
import Game from '../models/Game.js';
import Question from '../models/Question.js';
import mongoose from 'mongoose';

interface GameRoom {
  gameId: string;
  sockets: Set<string>;
  currentPhase?: 'pick_subject' | 'pick_type' | 'question' | 'results';
  selectedSubjectId?: string;
  selectedTypeId?: string;
  playerAnswers?: Record<string, { optionId: string; timestamp: number }>; // {playerId: {optionId, timestamp}}
  currentQuestion?: any;
  players?: any[];
  pickerIndex?: number; // Which player picks (rotates for subject/type)
  pickPhase?: 'subject' | 'type'; // What they're picking
}

const gameRooms = new Map<string, GameRoom>();

export const setupGameSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join game room
    socket.on('join-game', async (data: string | { gameId: string; playerName?: string; isHost?: boolean }) => {
      const gameId = typeof data === 'string' ? data : data.gameId;
      const playerName = typeof data === 'object' ? data.playerName : undefined;
      const isHost = typeof data === 'object' ? data.isHost : false;
      
      socket.join(gameId);
      
      if (!gameRooms.has(gameId)) {
        gameRooms.set(gameId, { gameId, sockets: new Set() });
      }
      
      gameRooms.get(gameId)!.sockets.add(socket.id);
      
      // Store player info in socket data
      (socket as any).playerName = playerName;
      (socket as any).isHost = isHost;
      (socket as any).gameId = gameId;
      
      // Check if it's a local game ID (starts with "local-")
      if (gameId.startsWith('local-')) {
        // Create a local game state for local games
        const localGameState = {
          _id: gameId,
          status: 'waiting',
          teams: [],
          currentRound: 0,
          rounds: [],
          extraSauceEnabled: true,
          pointDistribution: {
            correct: 10,
            timeBonus: 5,
            difficultyMultiplier: true,
          },
        };
        socket.emit('game-state', localGameState);
        return;
      }
      
      // For room-based games (using room codes)
      // Emit player joined event to all in room (including sender so host sees it)
      if (playerName) {
        console.log(`🔵 [BACKEND] Player ${playerName} (${socket.id}) joined room ${gameId}, isHost: ${isHost}`);
        // Emit to all in room including the sender
        io.to(gameId).emit('player-joined', { 
          socketId: socket.id,
          playerName,
          isHost 
        });
        
          // If game is already active/configured, send state to the joiner
          if (gameRooms.has(gameId)) {
            const room = gameRooms.get(gameId)!;
            // Send players if available (implies game started or configured)
            if (room.players && room.players.length > 0) {
               socket.emit('game-started', { 
                 players: room.players,
                 pickerIndex: room.pickerIndex,
                 pickPhase: room.pickPhase,
               });
            }
            // Send current phase
            if (room.currentPhase) {
               socket.emit('game-phase-changed', { phase: room.currentPhase });
            }
            // Send current question
            if (room.currentQuestion) {
               socket.emit('question-loaded', { question: room.currentQuestion });
            }
          }

        console.log(`🔵 [BACKEND] Emitted player-joined to room ${gameId}`);
        
        // If player (not host), wait longer before requesting config to let host add them first
        if (!isHost) {
          setTimeout(() => {
            console.log(`🔵 [BACKEND] Player requesting config after join (delayed)`);
            io.to(gameId).emit('host-send-config');
          }, 800); // Wait 800ms for host to process player-joined and update state
        }
      }
    });
    
    // Handle game config updates from host
    socket.on('update-game-config', (config: any) => {
      const gameId = (socket as any).gameId;
      if (gameId) {
        const room = gameRooms.get(gameId);
        if (room) {
        // Store players in room for game logic
        if (config.players) {
          room.players = config.players;
          // Initialize picker to first player
          if (room.pickerIndex === undefined && config.players.length > 0) {
            room.pickerIndex = 0;
            room.pickPhase = 'subject';
          }
        }
        }
        console.log(`🔵 [BACKEND] Broadcasting game config to room ${gameId}`);
        console.log(`🔵 [BACKEND] Config players count:`, config.players?.length || 0);
        // Broadcast to all players in room (including sender for testing, but host shouldn't need it)
        io.to(gameId).emit('game-config-updated', config);
        console.log(`🔵 [BACKEND] Config broadcasted to room ${gameId}`);
      } else {
        console.error(`🔵 [BACKEND] No gameId found for config update`);
      }
    });
    
    // Handle game config request (deprecated - now handled in join-game)
    socket.on('request-game-config', () => {
      const gameId = (socket as any).gameId;
      if (gameId) {
        console.log(`🔵 [BACKEND] Direct config request for room ${gameId}`);
        // Request host to send config
        io.to(gameId).emit('host-send-config');
      }
    });

    // Leave game room
    socket.on('leave-game', (gameId: string) => {
      socket.leave(gameId);
      const room = gameRooms.get(gameId);
      if (room) {
        room.sockets.delete(socket.id);
        if (room.sockets.size === 0) {
          gameRooms.delete(gameId);
        }
      }
    });

    // ============ NEW GAME FLOW EVENTS ============
    
    // Start game - initialize players
    socket.on('start-game', (data: { gameId: string; players: any[] }) => {
      const { gameId, players } = data;
      const room = gameRooms.get(gameId);
      if (room) {
        room.players = players.map((p: any) => ({ ...p, score: 0 }));
        // Initialize picker state: first player picks subject first
        room.pickerIndex = 0;
        room.pickPhase = 'subject';
        room.currentPhase = 'pick_subject';
        console.log(`🔵 [BACKEND] Game started for room ${gameId} with ${players.length} players`);
        console.log(`🔵 [BACKEND] Broadcasting game-started to all ${room.sockets.size} sockets in room ${gameId}`);
        // Broadcast to ALL players in the room (including host)
        io.to(gameId).emit('game-started', { 
          players: room.players,
          pickerIndex: room.pickerIndex,
          pickPhase: room.pickPhase,
        });
        console.log(`🔵 [BACKEND] game-started event broadcasted`);
      } else {
        console.error(`🔵 [BACKEND] Room ${gameId} not found when trying to start game`);
      }
    });
    
    // Game phase changed
    socket.on('game-phase-changed', (data: { gameId: string; phase: string }) => {
      const { gameId, phase } = data;
      const room = gameRooms.get(gameId);
      if (room) {
        room.currentPhase = phase as any;
        io.to(gameId).emit('game-phase-changed', { phase });
      }
    });

    // Update picker
    socket.on('update-picker', (data: { gameId: string; pickerIndex: number; pickPhase: 'subject' | 'type' }) => {
      const { gameId, pickerIndex, pickPhase } = data;
      const room = gameRooms.get(gameId);
      if (room) {
        room.pickerIndex = pickerIndex;
        room.pickPhase = pickPhase;
        io.to(gameId).emit('picker-updated', { pickerIndex, pickPhase });
      }
    });

    // Select subject
    socket.on('select-subject', (data: { gameId: string; subjectId: string }) => {
      const { gameId, subjectId } = data;
      const room = gameRooms.get(gameId);
      if (room) {
        room.selectedSubjectId = subjectId;
        console.log(`🔵 [BACKEND] Subject selected: ${subjectId} for room ${gameId}`);
        io.to(gameId).emit('subject-selected', { subjectId });

        // Move to next player to pick type
        if (room.players && room.players.length > 0) {
          room.pickerIndex = ((room.pickerIndex || 0) + 1) % room.players.length;
          room.pickPhase = 'type';
        }
        
        // Automatically advance to type picking phase
        console.log(`🔵 [BACKEND] Auto-advancing to pick_type phase for room ${gameId}`);
        room.currentPhase = 'pick_type';
        io.to(gameId).emit('game-phase-changed', { phase: 'pick_type' });
        io.to(gameId).emit('picker-updated', { pickerIndex: room.pickerIndex, pickPhase: room.pickPhase });
      }
    });

    // Select question type
    socket.on('select-type', (data: { gameId: string; typeId: string }) => {
      const { gameId, typeId } = data;
      const room = gameRooms.get(gameId);
      if (room) {
        room.selectedTypeId = typeId;
        console.log(`🔵 [BACKEND] Type selected: ${typeId} for room ${gameId}`);
        io.to(gameId).emit('type-selected', { typeId });

        // Now load the question automatically
        console.log(`🔵 [BACKEND] Loading question for room ${gameId} with subject: ${room.selectedSubjectId}, type: ${typeId}`);
        // We'll let the load-question event handle the actual loading
      }
    });

    // Load question
    socket.on('load-question', async (data: { gameId: string; subjectId: string; typeId: string }) => {
      const { gameId, subjectId, typeId } = data;
      const room = gameRooms.get(gameId);
      if (!room) return;

      try {
        const filter: any = {};
        
        // Handle subjectId
        if (mongoose.Types.ObjectId.isValid(subjectId)) {
          filter.subjectId = new mongoose.Types.ObjectId(subjectId);
        } else {
          const subject = await mongoose.model('Subject').findOne({ 
            $or: [{ name: subjectId }, { nameAr: subjectId }, { _id: subjectId }]
          });
          if (subject) {
            filter.subjectId = subject._id;
          }
        }
        
        // Handle questionTypeId
        if (mongoose.Types.ObjectId.isValid(typeId)) {
          filter.questionTypeId = new mongoose.Types.ObjectId(typeId);
        } else {
          filter.questionTypeId = typeId;
        }

        let questions = await Question.find(filter);
        
        // Fallback if no questions found
        if (questions.length === 0) {
          if (filter.subjectId) {
            questions = await Question.find({ subjectId: filter.subjectId });
          }
          if (questions.length === 0) {
            questions = await Question.find({ questionTypeId: typeId });
          }
        }

        if (questions.length === 0) {
          console.error(`No questions found for subjectId: ${subjectId}, typeId: ${typeId}`);
          socket.emit('error', { 
            message: 'No questions found',
            details: 'لا توجد أسئلة متاحة. يرجى التأكد من وجود أسئلة في قاعدة البيانات.'
          });
          return;
        }

        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        await randomQuestion.populate('subjectId');
        
        const questionObj = randomQuestion.toObject();
        questionObj.id = questionObj._id.toString();
        
        room.currentQuestion = questionObj;
        room.playerAnswers = {};
        
        console.log(`🔵 [BACKEND] Question loaded for room ${gameId}`);
        io.to(gameId).emit('question-loaded', { question: questionObj });
      } catch (error: any) {
        console.error('Error loading question:', error);
        socket.emit('error', { 
          message: error.message || 'حدث خطأ في تحميل السؤال',
          details: error.stack 
        });
      }
    });

    // Player answer
    socket.on('player-answer', (data: { gameId: string; playerId: string; optionId: string }) => {
      const { gameId, playerId, optionId } = data;
      const room = gameRooms.get(gameId);
      if (!room || !room.playerAnswers) return;

      // Store player's answer
      const timestamp = Date.now();
      room.playerAnswers[playerId] = { optionId, timestamp };
      
      console.log(`🔵 [BACKEND] Player ${playerId} answered: ${optionId}`);
      io.to(gameId).emit('player-answer-locked', { playerId, optionId, timestamp });
    });

    // Reveal results
    socket.on('reveal-results', (data: { gameId: string }) => {
      const { gameId } = data;
      const room = gameRooms.get(gameId);
      if (!room || !room.currentQuestion || !room.playerAnswers) return;

      const correctOptionId = room.currentQuestion.options?.find((o: any) => o.isCorrect)?.id;
      const scores: Record<string, number> = {};
      const playerAnswers: Record<string, { optionId: string; timestamp: number }> = {};
      
      // Initialize scores
      if (room.players) {
        room.players.forEach((player: any) => {
          scores[player.id] = player.score || 0;
          if (room.playerAnswers?.[player.id]) {
            playerAnswers[player.id] = room.playerAnswers[player.id];
          }
        });
      }

      // Calculate scores
      const correctPlayers: Array<{ playerId: string; timestamp: number }> = [];
      
      Object.entries(room.playerAnswers || {}).forEach(([playerId, answer]) => {
        if (answer.optionId === correctOptionId) {
          correctPlayers.push({ playerId, timestamp: answer.timestamp });
          scores[playerId] = (scores[playerId] || 0) + (room.currentQuestion?.points || 10);
        }
      });

      // Award speed bonus to fastest correct player
      if (correctPlayers.length > 1) {
        correctPlayers.sort((a, b) => a.timestamp - b.timestamp);
        const fastestPlayer = correctPlayers[0].playerId;
        scores[fastestPlayer] = (scores[fastestPlayer] || 0) + 5;
      }

      // Update room players scores
      if (room.players) {
        room.players.forEach((player: any) => {
          player.score = scores[player.id] || player.score || 0;
        });
      }

      console.log(`🔵 [BACKEND] Results revealed for room ${gameId}`);
      io.to(gameId).emit('results-revealed', { playerAnswers, scores });
    });

    // Round ended
    socket.on('round-ended', (data: { gameId: string }) => {
      const { gameId } = data;
      const room = gameRooms.get(gameId);
      if (room && room.players && room.players.length > 0) {
        // Clear round data
        room.selectedSubjectId = undefined;
        room.selectedTypeId = undefined;
        room.currentQuestion = undefined;
        room.playerAnswers = {};
        
        // Rotate picker: move to next player for subject picking
        if (room.pickerIndex !== undefined) {
          room.pickerIndex = (room.pickerIndex + 1) % room.players.length;
        } else {
          // Initialize if not set
          room.pickerIndex = 0;
        }
        
        room.pickPhase = 'subject';
        room.currentPhase = 'pick_subject'; // Always start with picking subject
        
        console.log(`🔵 [BACKEND] Round ended for room ${gameId}`);
        console.log(`🔵 [BACKEND] Next: Player ${room.pickerIndex} picks subject`);
        io.to(gameId).emit('round-ended', {
          players: room.players,
          pickerIndex: room.pickerIndex,
          pickPhase: room.pickPhase,
        });
      }
    });

    // Game actions
    socket.on('game-action', async (data: { gameId: string; action: string; payload: any }) => {
      const { gameId, action, payload } = data;
      
      // Handle local games (don't save to database)
      if (gameId.startsWith('local-')) {
        // For local games, just broadcast the action
        io.to(gameId).emit('game-action-local', { action, payload });
        return;
      }
      
      try {
        const game = await Game.findById(gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        switch (action) {
          case 'start':
            game.status = 'active';
            game.currentRound = 1;
            break;
          
          case 'pause':
            game.status = 'paused';
            break;
          
          case 'resume':
            game.status = 'active';
            break;
          
          case 'reset':
            game.status = 'waiting';
            game.currentRound = 0;
            game.teams.forEach(team => team.score = 0);
            game.rounds = [];
            break;
          
          case 'update-settings':
            if (payload.extraSauceEnabled !== undefined) {
              game.extraSauceEnabled = payload.extraSauceEnabled;
            }
            if (payload.pointDistribution) {
              game.pointDistribution = { ...game.pointDistribution, ...payload.pointDistribution };
            }
            break;
          
          case 'select-subject':
            if (game.rounds.length === 0 || game.rounds[game.rounds.length - 1].subjectId) {
              game.rounds.push({
                id: `round-${Date.now()}`,
                number: game.currentRound,
                currentTeamId: payload.teamId,
                timeRemaining: 0,
                pointsAwarded: 0,
              });
            }
            const lastRound = game.rounds[game.rounds.length - 1];
            lastRound.subjectId = payload.subjectId;
            break;
          
          case 'select-question-type':
            const currentRound = game.rounds[game.rounds.length - 1];
            if (currentRound) {
              currentRound.questionTypeId = payload.questionTypeId;
            }
            break;
          
          case 'answer-question':
            const round = game.rounds[game.rounds.length - 1];
            if (round) {
              round.isCorrect = payload.isCorrect;
              round.answeredAt = new Date();
              if (payload.isCorrect) {
                // Note: Game model still uses teams, but we're using players in memory
                // For now, we'll update the team that matches the player
                const team = game.teams.find((t: any) => t.id === payload.teamId || t.players?.some((p: any) => p.id === payload.playerId));
                if (team) {
                  team.score += payload.points || game.pointDistribution.correct;
                  round.pointsAwarded = payload.points || game.pointDistribution.correct;
                }
              }
            }
            break;
        }

        await game.save();
        io.to(gameId).emit('game-state-updated', game);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      const gameId = (socket as any).gameId;
      const playerName = (socket as any).playerName;
      
      // Notify others in room
      if (gameId && playerName) {
        io.to(gameId).emit('player-left', { socketId: socket.id, playerName });
      }
      
      // Clean up rooms
      for (const [roomId, room] of gameRooms.entries()) {
        if (room.sockets.has(socket.id)) {
          room.sockets.delete(socket.id);
          if (room.sockets.size === 0) {
            gameRooms.delete(roomId);
          }
        }
      }
    });
  });
};

