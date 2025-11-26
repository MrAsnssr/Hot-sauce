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
    socket.on('join-game', async (gameId: string) => {
      socket.join(gameId);
      
      if (!gameRooms.has(gameId)) {
        gameRooms.set(gameId, { gameId, sockets: new Set() });
      }
      
      gameRooms.get(gameId)!.sockets.add(socket.id);
      
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
      
      // Try to find game in database
      try {
        const game = await Game.findById(gameId);
        if (game) {
          socket.emit('game-state', game);
          io.to(gameId).emit('player-joined', { socketId: socket.id });
        }
      } catch (error) {
        // Invalid ObjectId or game not found - use local state
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
      // Clean up rooms
      for (const [gameId, room] of gameRooms.entries()) {
        if (room.sockets.has(socket.id)) {
          room.sockets.delete(socket.id);
          if (room.sockets.size === 0) {
            gameRooms.delete(gameId);
          }
        }
      }
    });
  });
};

