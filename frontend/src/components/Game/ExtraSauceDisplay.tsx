import React, { useState, useEffect } from 'react';
import { PowerRegistry } from '../../types/power.registry';
import { Power } from '../../types/power.types';
import { Button } from '../Shared/Button';

interface ExtraSauceDisplayProps {
  enabled: boolean;
  onSelect: (power: Power) => void;
  usedPowers?: string[];
}

export const ExtraSauceDisplay: React.FC<ExtraSauceDisplayProps> = ({
  enabled,
  onSelect,
  usedPowers = [],
}) => {
  const [powers, setPowers] = useState<Power[]>([]);
  const [isPositive, setIsPositive] = useState(true);

  useEffect(() => {
    const allPowers = isPositive
      ? PowerRegistry.getPositive()
      : PowerRegistry.getNegative();
    setPowers(allPowers);
  }, [isPositive]);

  if (!enabled) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
        <p className="text-white text-lg">نظام الصلصة الإضافية معطل</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="flex gap-2 mb-4">
        <Button
          variant={isPositive ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setIsPositive(true)}
        >
          صلصات إيجابية
        </Button>
        <Button
          variant={!isPositive ? 'danger' : 'secondary'}
          size="sm"
          onClick={() => setIsPositive(false)}
        >
          صلصات سلبية
        </Button>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">
        {isPositive ? 'اختر صلصة إيجابية' : 'اختر صلصة سلبية'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {powers.map((power) => {
          const isUsed = usedPowers.includes(power.id);
          return (
            <button
              key={power.id}
              onClick={() => !isUsed && onSelect(power)}
              disabled={isUsed}
              className={`p-4 rounded-lg text-right transition-all ${
                isUsed
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : isPositive
                  ? 'bg-green-600/80 hover:bg-green-600 text-white'
                  : 'bg-red-600/80 hover:bg-red-600 text-white'
              }`}
            >
              <div className="font-bold text-lg">{power.nameAr}</div>
              <div className="text-sm mt-1 opacity-90">{power.descriptionAr}</div>
              {isUsed && <div className="text-xs mt-2 opacity-70">مستخدم</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

