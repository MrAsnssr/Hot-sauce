import { Power, PowerEffect } from '../types/power.types';
import { Question } from '../types/question.types';

export const applyPowerEffect = (
  question: Question,
  power: Power,
  timeRemaining: number
): { question: Question; timeRemaining: number } => {
  let modifiedQuestion = { ...question };
  let modifiedTime = timeRemaining;

  switch (power.effect) {
    case 'add_time':
      modifiedTime += power.value || 10;
      break;

    case 'subtract_time':
      modifiedTime = Math.max(0, modifiedTime - (power.value || 10));
      break;

    case 'remove_option':
      if (modifiedQuestion.options && modifiedQuestion.options.length > 2) {
        const incorrectOptions = modifiedQuestion.options.filter(
          (opt) => !opt.isCorrect
        );
        if (incorrectOptions.length > 0) {
          const randomIncorrect = incorrectOptions[
            Math.floor(Math.random() * incorrectOptions.length)
          ];
          modifiedQuestion.options = modifiedQuestion.options.filter(
            (opt) => opt.id !== randomIncorrect.id
          );
        }
      }
      break;

    case 'double_points':
      modifiedQuestion.points *= 2;
      break;

    case 'blind_guess':
      modifiedQuestion.options = undefined;
      break;

    case 'higher_difficulty':
      modifiedQuestion.difficulty = 'hard';
      modifiedQuestion.points = Math.floor(modifiedQuestion.points * 1.5);
      break;

    case 'mystery_question':
      modifiedQuestion.text = 'سؤال غامض: ' + modifiedQuestion.text.substring(0, 20) + '...';
      break;

    default:
      break;
  }

  return { question: modifiedQuestion, timeRemaining: modifiedTime };
};

export const calculatePoints = (
  basePoints: number,
  isCorrect: boolean,
  timeRemaining: number,
  totalTime: number,
  difficulty: 'easy' | 'medium' | 'hard',
  pointDistribution: {
    correct: number;
    timeBonus: number;
    difficultyMultiplier: boolean;
  },
  powerEffect?: PowerEffect
): number => {
  if (!isCorrect) return 0;

  let points = basePoints || pointDistribution.correct;

  // Time bonus
  if (timeRemaining > 0 && pointDistribution.timeBonus > 0) {
    const timeRatio = timeRemaining / totalTime;
    points += Math.floor(pointDistribution.timeBonus * timeRatio);
  }

  // Difficulty multiplier
  if (pointDistribution.difficultyMultiplier) {
    const multipliers = { easy: 1, medium: 1.2, hard: 1.5 };
    points = Math.floor(points * multipliers[difficulty]);
  }

  // Power effects
  if (powerEffect === 'double_points') {
    points *= 2;
  }

  return Math.floor(points);
};

export const getNextTeamRole = (currentRole: 'subject_picker' | 'type_picker') => {
  return currentRole === 'subject_picker' ? 'type_picker' : 'subject_picker';
};

export const shouldShowExtraSauce = (
  extraSauceEnabled: boolean,
  round: number
): boolean => {
  return extraSauceEnabled && round > 0;
};

