import { create } from 'zustand';
import { GameState, Player, Round } from '../types/game.types'; // Round is used in addRound
import { Question, Subject, QuestionType } from '../types/question.types';

interface GameStore {
  gameState: GameState | null;
  currentQuestion: Question | null;
  selectedSubject: Subject | null;
  selectedQuestionType: QuestionType | null;
  setGameState: (state: GameState) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  addRound: (round: Round) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setSelectedSubject: (subject: Subject | null) => void;
  setSelectedQuestionType: (type: QuestionType | null) => void;
  reset: () => void;
}

export const useGameState = create<GameStore>((set) => ({
  gameState: null,
  currentQuestion: null,
  selectedSubject: null,
  selectedQuestionType: null,
  setGameState: (state) => set({ gameState: state }),
  updatePlayer: (playerId, updates) =>
    set((state) => {
      if (!state.gameState) return state;
      const players = state.gameState.players.map((player) =>
        player.id === playerId ? { ...player, ...updates } : player
      );
      return {
        gameState: { ...state.gameState, players },
      };
    }),
  addRound: (round) =>
    set((state) => {
      if (!state.gameState) return state;
      return {
        gameState: {
          ...state.gameState,
          rounds: [...state.gameState.rounds, round],
        },
      };
    }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
  setSelectedQuestionType: (type) => set({ selectedQuestionType: type }),
  reset: () =>
    set({
      gameState: null,
      currentQuestion: null,
      selectedSubject: null,
      selectedQuestionType: null,
    }),
}));

