import { Power, PowerEffect } from './power.types';

export class PowerRegistry {
  private static powers: Map<PowerEffect, Power> = new Map();

  static register(power: Power): void {
    this.powers.set(power.effect, power);
  }

  static get(effect: PowerEffect): Power | undefined {
    return this.powers.get(effect);
  }

  static getAll(): Power[] {
    return Array.from(this.powers.values());
  }

  static getPositive(): Power[] {
    return this.getAll().filter(p => p.isPositive);
  }

  static getNegative(): Power[] {
    return this.getAll().filter(p => !p.isPositive);
  }
}

// Initialize default powers
export const initializeDefaultPowers = () => {
  // Super Powers
  PowerRegistry.register({
    id: 'add_time',
    name: 'Add Time',
    nameAr: '+10 ثواني',
    description: 'Add 10 seconds to the timer',
    descriptionAr: 'إضافة 10 ثواني للوقت',
    effect: 'add_time',
    value: 10,
    isPositive: true,
    color: '#10b981',
  });

  PowerRegistry.register({
    id: 'remove_option',
    name: 'Remove Option',
    nameAr: 'حذف خيار',
    description: 'Remove one incorrect option',
    descriptionAr: 'حذف خيار خاطئ واحد',
    effect: 'remove_option',
    isPositive: true,
    color: '#3b82f6',
  });

  PowerRegistry.register({
    id: 'alternative_question',
    name: 'Alternative Question',
    nameAr: 'سؤال بديل',
    description: 'Get an alternative question',
    descriptionAr: 'الحصول على سؤال بديل',
    effect: 'alternative_question',
    isPositive: true,
    color: '#8b5cf6',
  });

  PowerRegistry.register({
    id: 'double_points',
    name: 'Double Points',
    nameAr: 'مضاعفة النقاط',
    description: 'Double the points for this question',
    descriptionAr: 'مضاعفة النقاط لهذا السؤال',
    effect: 'double_points',
    isPositive: true,
    color: '#f59e0b',
  });

  PowerRegistry.register({
    id: 'change_question_type',
    name: 'Change Question Type',
    nameAr: 'تغيير نوع السؤال',
    description: 'Change the question type',
    descriptionAr: 'تغيير نوع السؤال',
    effect: 'change_question_type',
    isPositive: true,
    color: '#ec4899',
  });

  PowerRegistry.register({
    id: 'steal_point',
    name: 'Steal Point',
    nameAr: 'سرقة نقطة من الخصم',
    description: 'Steal one point from opponent',
    descriptionAr: 'سرقة نقطة واحدة من الخصم',
    effect: 'steal_point',
    isPositive: true,
    color: '#ef4444',
  });

  PowerRegistry.register({
    id: 'ask_friend',
    name: 'Ask Friend',
    nameAr: 'إسأل صديق',
    description: 'Get help from a friend (Joker)',
    descriptionAr: 'الحصول على مساعدة من صديق (جوكر)',
    effect: 'ask_friend',
    isPositive: true,
    color: '#14b8a6',
  });

  // Negative Sauces
  PowerRegistry.register({
    id: 'subtract_time',
    name: 'Subtract Time',
    nameAr: '−10 ثواني',
    description: 'Subtract 10 seconds from timer',
    descriptionAr: 'خصم 10 ثواني من الوقت',
    effect: 'subtract_time',
    value: 10,
    isPositive: false,
    color: '#dc2626',
  });

  PowerRegistry.register({
    id: 'higher_difficulty',
    name: 'Higher Difficulty',
    nameAr: 'سؤال من مستوى أعلى',
    description: 'Question from higher difficulty level',
    descriptionAr: 'سؤال من مستوى صعوبة أعلى',
    effect: 'higher_difficulty',
    isPositive: false,
    color: '#991b1b',
  });

  PowerRegistry.register({
    id: 'blind_guess',
    name: 'Blind Guess',
    nameAr: 'تخمين عمياني',
    description: 'Answer without options',
    descriptionAr: 'الإجابة بدون خيارات',
    effect: 'blind_guess',
    isPositive: false,
    color: '#7c2d12',
  });

  PowerRegistry.register({
    id: 'skip_turn',
    name: 'Skip Turn',
    nameAr: 'فقدان دور',
    description: 'Lose your turn',
    descriptionAr: 'فقدان دورك',
    effect: 'skip_turn',
    isPositive: false,
    color: '#78350f',
  });

  PowerRegistry.register({
    id: 'lose_point',
    name: 'Lose Point',
    nameAr: 'خصم نقطة',
    description: 'Lose one point',
    descriptionAr: 'خصم نقطة واحدة',
    effect: 'lose_point',
    isPositive: false,
    color: '#7f1d1d',
  });

  PowerRegistry.register({
    id: 'mystery_question',
    name: 'Mystery Question',
    nameAr: 'سؤال غامض جداً',
    description: 'Very mysterious question without hints',
    descriptionAr: 'سؤال غامض جداً بدون أي تلميحات',
    effect: 'mystery_question',
    isPositive: false,
    color: '#581c87',
  });

  PowerRegistry.register({
    id: 'reverse_time',
    name: 'Reverse Time',
    nameAr: 'انقلب الوقت لصالح الخصم',
    description: 'Time reverses in favor of opponent',
    descriptionAr: 'انقلاب الوقت لصالح الخصم',
    effect: 'reverse_time',
    isPositive: false,
    color: '#6b21a8',
  });
};

