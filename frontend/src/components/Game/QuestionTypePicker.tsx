import React from 'react';
import { QuestionType } from '../../types/question.types';
import { HARDCODED_QUESTION_TYPES } from '../../constants/questionTypes';

interface QuestionTypePickerProps {
  onSelect: (type: QuestionType) => void;
  selectedType?: QuestionType | null;
}

export const QuestionTypePicker: React.FC<QuestionTypePickerProps> = ({
  onSelect,
  selectedType,
}) => {
  const types = HARDCODED_QUESTION_TYPES;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">اختر نوع السؤال</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type)}
            className={`p-4 rounded-lg transition-all ${
              selectedType?.id === type.id
                ? 'bg-purple-600 text-white scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <div className="font-bold text-lg">{type.nameAr}</div>
            <div className="text-sm mt-1 opacity-80">{type.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

