import React, { useState } from 'react';
import { Question } from '../../types/question.types';
import { Timer } from '../Shared/Timer';
import { Button } from '../Shared/Button';

interface QuestionDisplayProps {
  question: Question;
  onAnswer: (answerId: string, isCorrect: boolean) => void;
  timeLimit: number;
  onTimeUp?: () => void;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  onAnswer,
  timeLimit,
  onTimeUp,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (answerId: string) => {
    if (answered) return;
    
    setSelectedAnswer(answerId);
    setAnswered(true);

    if (question.options) {
      const option = question.options.find((opt) => opt.id === answerId);
      onAnswer(answerId, option?.isCorrect || false);
    } else if (question.correctAnswer) {
      onAnswer(answerId, answerId === question.correctAnswer);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="text-white/80 text-sm mb-2">
            {question.difficulty === 'easy' && 'سهل'}
            {question.difficulty === 'medium' && 'متوسط'}
            {question.difficulty === 'hard' && 'صعب'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">{question.text}</h2>
        </div>
        <Timer initialTime={timeLimit} onTimeUp={onTimeUp} paused={answered} />
      </div>

      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="Question"
          className="w-full max-w-md mx-auto mb-4 rounded-lg"
        />
      )}

      {question.options && question.options.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.isCorrect;
            const showResult = answered && isSelected;

            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                disabled={answered}
                className={`p-4 rounded-lg text-right transition-all ${
                  showResult
                    ? isCorrect
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${answered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-white">
          <p className="mb-4">هذا السؤال يتطلب إجابة نصية</p>
          <input
            type="text"
            placeholder="اكتب إجابتك هنا"
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            dir="rtl"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                handleAnswer(e.currentTarget.value);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

