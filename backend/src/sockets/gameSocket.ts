import { Server, Socket } from 'socket.io';
import Game from '../models/Game.js';
import Question from '../models/Question.js';
import mongoose from 'mongoose';

interface GameRoom {
  gameId: string;
  sockets: Set<string>;
  currentPhase?: 'pick_subject' | 'pick_type' | 'question' | 'results';
  subjectPickerTeamId?: string;
  selectedSubjectId?: string;
  selectedTypeId?: string;
  votes?: Record<string, Record<string, string>>; // {teamId: {playerId: optionId}}
  lockedAnswers?: Record<string, { optionId: string; timestamp: number }>; // {teamId: {optionId, timestamp}}
  currentQuestion?: any;
  teams?: any[];
  firstPickerIndex?: number; // Which team picks first
  firstPickIsSubject?: boolean; // Whether first pick is subject (true) or type (false)
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
          // Send teams if available (implies game started or configured)
          if (room.teams && room.teams.length > 0) {
             socket.emit('game-started', { teams: room.teams });
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
          // Store teams in room for game logic
          if (config.teams) {
            room.teams = config.teams;
            // Initialize subject picker to first team
            if (!room.subjectPickerTeamId && config.teams.length > 0) {
              room.subjectPickerTeamId = config.teams[0].id;
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
    
    // Start game - initialize teams
    socket.on('start-game', (data: { gameId: string; teams: any[] }) => {
      const { gameId, teams } = data;
      const room = gameRooms.get(gameId);
      if (room) {
        room.teams = teams.map((t: any) => ({ ...t, score: 0 }));
        // Initialize picker state: first team picks subject first
        room.firstPickerIndex = 0;
        room.firstPickIsSubject = true;
        room.subjectPickerTeamId = teams[0]?.id;
        room.currentPhase = 'pick_subject';
        console.log(`🔵 [BACKEND] Game started for room ${gameId} with ${teams.length} teams`);
        console.log(`🔵 [BACKEND] Broadcasting game-started to all ${room.sockets.size} sockets in room ${gameId}`);
        // Broadcast to ALL players in the room (including host)
        io.to(gameId).emit('game-started', { 
          teams: room.teams,
          firstPickerIndex: room.firstPickerIndex,
          firstPickIsSubject: room.firstPickIsSubject,
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

    // Select subject
    socket.on('select-subject', (data: { gameId: string; subjectId: string }) => {
      const { gameId, subjectId } = data;
      const room = gameRooms.get(gameId);
      if (room) {
        room.selectedSubjectId = subjectId;
        console.log(`🔵 [BACKEND] Subject selected: ${subjectId} for room ${gameId}`);
        io.to(gameId).emit('subject-selected', { subjectId });
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
        room.votes = {};
        room.lockedAnswers = {};
        
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

    // Player vote
    socket.on('player-vote', (data: { gameId: string; teamId: string; playerId: string; optionId: string }) => {
      const { gameId, teamId, playerId, optionId } = data;
      const room = gameRooms.get(gameId);
      if (!room || !room.votes) return;

      if (!room.votes[teamId]) {
        room.votes[teamId] = {};
      }
      
      room.votes[teamId][playerId] = optionId;
      
      // Broadcast vote update to team members
      io.to(gameId).emit('vote-updated', { teamId, votes: room.votes[teamId] });
      
      // Check if majority reached
      const teamVotes = room.votes[teamId];
      const voteCounts: Record<string, number> = {};
      Object.values(teamVotes).forEach(optId => {
        voteCounts[optId] = (voteCounts[optId] || 0) + 1;
      });
      
      const totalVotes = Object.keys(teamVotes).length;
      if (totalVotes === 0) return; // No votes yet
      
      const voteValues = Object.values(voteCounts);
      if (voteValues.length === 0) return; // No vote counts
      
      const maxVotes = Math.max(...voteValues);
      const majority = Math.ceil(totalVotes / 2);
      
      // If majority reached and answer not locked yet
      if (maxVotes >= majority && !room.lockedAnswers?.[teamId]) {
        const winners = Object.keys(voteCounts).filter(opt => voteCounts[opt] === maxVotes);
        let winningOption = winners[0];
        
        // First player breaks tie
        if (winners.length > 1) {
          const firstVote = Object.entries(teamVotes).find(([pid, optId]) => winners.includes(optId as string));
          winningOption = firstVote ? (firstVote[1] as string) : winners[0];
        }
        
        const timestamp = Date.now();
        if (!room.lockedAnswers) room.lockedAnswers = {};
        room.lockedAnswers[teamId] = { optionId: winningOption, timestamp };
        
        console.log(`🔵 [BACKEND] Team ${teamId} locked answer: ${winningOption}`);
        io.to(gameId).emit('team-answer-locked', { teamId, optionId: winningOption, timestamp });
      }
    });

    // Reveal results
    socket.on('reveal-results', (data: { gameId: string }) => {
      const { gameId } = data;
      const room = gameRooms.get(gameId);
      if (!room || !room.currentQuestion || !room.lockedAnswers) return;

      const correctOptionId = room.currentQuestion.options?.find((o: any) => o.isCorrect)?.id;
      const scores: Record<string, number> = {};
      const teamAnswers: Record<string, { optionId: string; timestamp: number }> = {};
      
      // Initialize scores
      if (room.teams) {
        room.teams.forEach((team: any) => {
          scores[team.id] = team.score || 0;
          if (room.lockedAnswers?.[team.id]) {
            teamAnswers[team.id] = room.lockedAnswers[team.id];
          }
        });
      }

      // Calculate scores
      const correctTeams: Array<{ teamId: string; timestamp: number }> = [];
      
      Object.entries(room.lockedAnswers || {}).forEach(([teamId, answer]) => {
        if (answer.optionId === correctOptionId) {
          correctTeams.push({ teamId, timestamp: answer.timestamp });
          scores[teamId] = (scores[teamId] || 0) + (room.currentQuestion?.points || 10);
        }
      });

      // Award speed bonus to fastest correct team
      if (correctTeams.length > 1) {
        correctTeams.sort((a, b) => a.timestamp - b.timestamp);
        const fastestTeam = correctTeams[0].teamId;
        scores[fastestTeam] = (scores[fastestTeam] || 0) + 5;
      } else if (correctTeams.length === 1) {
        // Single correct team gets base points only (already added above)
      }

      // Update room teams scores
      if (room.teams) {
        room.teams.forEach((team: any) => {
          team.score = scores[team.id] || team.score || 0;
        });
      }

      console.log(`🔵 [BACKEND] Results revealed for room ${gameId}`);
      io.to(gameId).emit('results-revealed', { teamAnswers, scores });
    });

    // Round ended
    socket.on('round-ended', (data: { gameId: string }) => {
      const { gameId } = data;
      const room = gameRooms.get(gameId);
      if (room && room.teams && room.teams.length > 0) {
        // Clear round data
        room.selectedSubjectId = undefined;
        room.selectedTypeId = undefined;
        room.currentQuestion = undefined;
        room.votes = {};
        room.lockedAnswers = {};
        
        // Rotate picker: rotate ONLY the team index. Keep picking subject first.
        if (room.firstPickerIndex !== undefined) {
          room.firstPickerIndex = (room.firstPickerIndex + 1) % room.teams.length;
          // room.firstPickIsSubject = true; // Always true to ensure rotation works
        } else {
          // Initialize if not set
          room.firstPickerIndex = 0;
          room.firstPickIsSubject = true;
        }
        
        // Ensure firstPickIsSubject is always true for proper rotation
        room.firstPickIsSubject = true;
        
        // Determine which team picks what
        const secondPickerIndex = (room.firstPickerIndex! + 1) % room.teams.length;
        const subjectPickerIndex = room.firstPickIsSubject ? room.firstPickerIndex! : secondPickerIndex;
        room.subjectPickerTeamId = room.teams[subjectPickerIndex]?.id;
        room.currentPhase = 'pick_subject'; // Always start with picking subject
        
        console.log(`🔵 [BACKEND] Round ended for room ${gameId}`);
        console.log(`🔵 [BACKEND] Next: Team ${room.firstPickerIndex} picks ${room.firstPickIsSubject ? 'subject' : 'type'} first`);
        io.to(gameId).emit('round-ended', { 
          subjectPickerTeamId: room.subjectPickerTeamId,
          teams: room.teams,
          firstPickerIndex: room.firstPickerIndex,
          firstPickIsSubject: room.firstPickIsSubject,
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

