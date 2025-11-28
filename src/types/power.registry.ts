// Power Registry System for Arabic Trivia Game
// This system manages all the "Extra Sauce" powers that can be applied during gameplay

export interface Power {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  effect: string;
  value?: number;
  isPositive: boolean;
  color: string;
}

export interface PowerEffect {
  type: 'add_points' | 'subtract_points' | 'skip_question' | 'extra_time' | 'power_disabled' | 'double_points';
  value?: number;
  target?: 'self' | 'opponent' | 'all';
  duration?: number; // in seconds, for temporary effects
}

class PowerRegistryClass {
  private powers: Map<string, Power> = new Map();

  register(power: Power): void {
    this.powers.set(power.id, power);
  }

  get(id: string): Power | undefined {
    return this.powers.get(id);
  }

  getAll(): Power[] {
    return Array.from(this.powers.values());
  }

  getPositivePowers(): Power[] {
    return this.getAll().filter(power => power.isPositive);
  }

  getNegativePowers(): Power[] {
    return this.getAll().filter(power => !power.isPositive);
  }

  getPowerEffect(powerId: string): PowerEffect | null {
    const power = this.get(powerId);
    if (!power) return null;

    // Define effects based on power ID
    switch (power.effect) {
      case 'add_points':
        return {
          type: 'add_points',
          value: power.value || 5,
          target: 'self'
        };

      case 'subtract_points':
        return {
          type: 'subtract_points',
          value: power.value || 5,
          target: 'opponent'
        };

      case 'double_points':
        return {
          type: 'double_points',
          target: 'self',
          duration: 30 // 30 seconds
        };

      case 'extra_time':
        return {
          type: 'extra_time',
          value: power.value || 15,
          target: 'self'
        };

      case 'skip_question':
        return {
          type: 'skip_question',
          target: 'self'
        };

      case 'power_disabled':
        return {
          type: 'power_disabled',
          target: 'opponent',
          duration: power.value || 30
        };

      default:
        return null;
    }
  }
}

export const PowerRegistry = new PowerRegistryClass();

// Initialize default powers
export function initializeDefaultPowers(): void {
  // Positive Powers
  PowerRegistry.register({
    id: 'bonus_points',
    name: 'Bonus Points',
    nameAr: 'نقاط إضافية',
    description: 'Add extra points to your score',
    descriptionAr: 'أضف نقاط إضافية لنتيجتك',
    effect: 'add_points',
    value: 5,
    isPositive: true,
    color: '#10B981' // green
  });

  PowerRegistry.register({
    id: 'double_points',
    name: 'Double Points',
    nameAr: 'نقاط مضاعفة',
    description: 'Double your points for the next question',
    descriptionAr: 'ضاعف نقاطك في السؤال التالي',
    effect: 'double_points',
    isPositive: true,
    color: '#F59E0B' // amber
  });

  PowerRegistry.register({
    id: 'extra_time',
    name: 'Extra Time',
    nameAr: 'وقت إضافي',
    description: 'Add 15 seconds to the timer',
    descriptionAr: 'أضف 15 ثانية للمؤقت',
    effect: 'extra_time',
    value: 15,
    isPositive: true,
    color: '#3B82F6' // blue
  });

  PowerRegistry.register({
    id: 'skip_question',
    name: 'Skip Question',
    nameAr: 'تخطي السؤال',
    description: 'Skip the current question without penalty',
    descriptionAr: 'تخطي السؤال الحالي بدون عقوبة',
    effect: 'skip_question',
    isPositive: true,
    color: '#8B5CF6' // purple
  });

  // Negative Powers
  PowerRegistry.register({
    id: 'steal_points',
    name: 'Steal Points',
    nameAr: 'سرقة النقاط',
    description: 'Steal 5 points from opponent',
    descriptionAr: 'اسرق 5 نقاط من الخصم',
    effect: 'subtract_points',
    value: 5,
    isPositive: false,
    color: '#EF4444' // red
  });

  PowerRegistry.register({
    id: 'disable_power',
    name: 'Disable Power',
    nameAr: 'تعطيل القوة',
    description: 'Disable opponent\'s powers for 30 seconds',
    descriptionAr: 'عطل قوى الخصم لمدة 30 ثانية',
    effect: 'power_disabled',
    value: 30,
    isPositive: false,
    color: '#6B7280' // gray
  });

  PowerRegistry.register({
    id: 'time_reduction',
    name: 'Time Reduction',
    nameAr: 'تقليل الوقت',
    description: 'Reduce opponent\'s time by 10 seconds',
    descriptionAr: 'قلل وقت الخصم بـ10 ثوان',
    effect: 'extra_time',
    value: -10,
    isPositive: false,
    color: '#F97316' // orange
  });
}
