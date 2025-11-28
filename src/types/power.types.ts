export type PowerEffect = 
  | 'add_time'
  | 'remove_option'
  | 'alternative_question'
  | 'double_points'
  | 'change_question_type'
  | 'steal_point'
  | 'ask_friend'
  | 'subtract_time'
  | 'higher_difficulty'
  | 'blind_guess'
  | 'skip_turn'
  | 'lose_point'
  | 'mystery_question'
  | 'reverse_time';

export interface Power {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  effect: PowerEffect;
  value?: number; // For effects that need a numeric value (e.g., +10 seconds)
  isPositive: boolean;
  icon?: string;
  color?: string;
}

export interface ExtraSauce {
  id: string;
  power: Power;
  applied: boolean;
  appliedAt?: Date;
}

