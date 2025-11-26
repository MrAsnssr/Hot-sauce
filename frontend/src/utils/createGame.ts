import api from './api';

export interface GameResponse {
  _id: string;
  status: string;
  teams: any[];
  currentRound: number;
  rounds: any[];
  extraSauceEnabled: boolean;
  pointDistribution: {
    correct: number;
    timeBonus: number;
    difficultyMultiplier: boolean;
  };
}

export const createGame = async (): Promise<GameResponse> => {
  try {
    const response = await api.post('/games', {
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
    });
    return response.data;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

