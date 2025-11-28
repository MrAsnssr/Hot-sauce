import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { GameSettings } from '../../types/game.types';
import { Button } from '../Shared/Button';
import api from '../../utils/api';

interface GameControlsProps {
  gameId: string;
}

export const GameControls: React.FC<GameControlsProps> = ({ gameId }) => {
  const socket = useSocket(gameId);
  const [settings, setSettings] = useState<GameSettings>({
    extraSauceEnabled: true,
    pointDistribution: {
      correct: 10,
      timeBonus: 5,
      difficultyMultiplier: true,
    },
    defaultTimeLimit: 30,
  });

  useEffect(() => {
    // Fetch current game settings
    const fetchSettings = async () => {
      try {
        const response = await api.get(`/games/${gameId}`);
        const game = response.data;
        setSettings({
          extraSauceEnabled: game.extraSauceEnabled,
          pointDistribution: game.pointDistribution,
          defaultTimeLimit: 30,
        });
      } catch (error) {
        console.error('Error fetching game settings:', error);
      }
    };
    fetchSettings();
  }, [gameId]);

  const handleAction = (action: string) => {
    if (socket) {
      socket.emit('game-action', {
        gameId,
        action,
        payload: {},
      });
    }
  };

  const handleSettingsUpdate = () => {
    if (socket) {
      socket.emit('game-action', {
        gameId,
        action: 'update-settings',
        payload: {
          extraSauceEnabled: settings.extraSauceEnabled,
          pointDistribution: settings.pointDistribution,
        },
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6">تحكم المضيف</h2>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
        <h3 className="text-2xl font-bold text-white mb-4">إعدادات اللعبة</h3>

        <div className="mb-4">
          <label className="flex items-center text-white mb-2">
            <input
              type="checkbox"
              checked={settings.extraSauceEnabled}
              onChange={(e) =>
                setSettings({ ...settings, extraSauceEnabled: e.target.checked })
              }
              className="ml-2 w-5 h-5"
            />
            تفعيل نظام الصلصة الإضافية
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-white mb-2">نقاط الإجابة الصحيحة</label>
            <input
              type="number"
              value={settings.pointDistribution.correct}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  pointDistribution: {
                    ...settings.pointDistribution,
                    correct: parseInt(e.target.value),
                  },
                })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
              min="1"
            />
          </div>
          <div>
            <label className="block text-white mb-2">مكافأة الوقت</label>
            <input
              type="number"
              value={settings.pointDistribution.timeBonus}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  pointDistribution: {
                    ...settings.pointDistribution,
                    timeBonus: parseInt(e.target.value),
                  },
                })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
              min="0"
            />
          </div>
          <div>
            <label className="flex items-center text-white mb-2">
              <input
                type="checkbox"
                checked={settings.pointDistribution.difficultyMultiplier}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pointDistribution: {
                      ...settings.pointDistribution,
                      difficultyMultiplier: e.target.checked,
                    },
                  })
                }
                className="ml-2"
              />
              مضاعف الصعوبة
            </label>
          </div>
        </div>

        <Button onClick={handleSettingsUpdate} variant="success">
          حفظ الإعدادات
        </Button>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-4">تحكم باللعبة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button onClick={() => handleAction('start')} variant="success" size="lg">
            بدء
          </Button>
          <Button onClick={() => handleAction('pause')} variant="secondary" size="lg">
            إيقاف
          </Button>
          <Button onClick={() => handleAction('resume')} variant="primary" size="lg">
            استئناف
          </Button>
          <Button onClick={() => handleAction('reset')} variant="danger" size="lg">
            إعادة تعيين
          </Button>
        </div>
      </div>
    </div>
  );
};

