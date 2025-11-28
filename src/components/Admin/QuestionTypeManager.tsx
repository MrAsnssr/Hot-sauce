import React from 'react';
import { QuestionType } from '../../types/question.types';
import { HARDCODED_QUESTION_TYPES } from '../../constants/questionTypes';

export const QuestionTypeManager: React.FC = () => {
  const questionTypes: QuestionType[] = HARDCODED_QUESTION_TYPES;

  // Question types are hardcoded and cannot be edited

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">أنواع الأسئلة</h2>
        <p className="text-white/60">أنواع الأسئلة محددة مسبقاً في الكود ولا يمكن تعديلها</p>
      </div>

      {/* Removed form - types are hardcoded */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questionTypes.map((type) => (
          <div key={type.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-xl font-bold text-white mb-2">{type.nameAr}</h3>
            <p className="text-white/80 mb-4">{type.description}</p>
            <div className="text-white/60 text-sm mb-4">
              <div>الوقت الافتراضي: {type.defaultTimeLimit} ثانية</div>
              <div>
                {type.requiresOptions && '• خيارات '}
                {type.requiresTextAnswer && '• إجابة نصية '}
                {type.supportsImage && '• صور '}
                {type.supportsAudio && '• صوت'}
              </div>
            </div>
            <div className="text-white/40 text-sm">
              نوع ثابت (لا يمكن التعديل)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

