import { Server, Socket } from 'socket.io';
import Game from '../models/Game.js';

interface GameRoom {
  gameId: string;
  sockets: Set<string>;
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
        console.log(`Player ${playerName} (${socket.id}) joined room ${gameId}, isHost: ${isHost}`);
        // Emit to all in room including the sender
        io.to(gameId).emit('player-joined', { 
          socketId: socket.id,
          playerName,
          isHost 
        });
        console.log(`Emitted player-joined to room ${gameId}`);
      }
      
      // Request game config from host if not host
      if (!isHost) {
        socket.emit('request-game-config');
      }
    });
    
    // Handle game config updates from host
    socket.on('update-game-config', (config: any) => {
      const gameId = (socket as any).gameId;
      if (gameId) {
        console.log(`Broadcasting game config to room ${gameId}`);
        // Broadcast to all players in room (including sender for testing, but host shouldn't need it)
        io.to(gameId).emit('game-config-updated', config);
      }
    });
    
    // Handle game config request
    socket.on('request-game-config', () => {
      const gameId = (socket as any).gameId;
      if (gameId) {
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
                const team = game.teams.find(t => t.id === payload.teamId);
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

