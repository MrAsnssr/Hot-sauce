import React, { useEffect, useState } from 'react';

interface TimerProps {
  initialTime: number;
  onTimeUp?: () => void;
  paused?: boolean;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({
  initialTime,
  onTimeUp,
  paused = false,
  className = '',
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (paused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, paused, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 10;

  return (
    <div
      className={`text-4xl font-bold ${
        isLowTime ? 'text-red-600 animate-pulse' : 'text-white'
      } ${className}`}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

