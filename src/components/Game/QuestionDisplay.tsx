import React, { useState, useEffect } from 'react';
import { Question, OrderItem, Person, Achievement } from '../../types/question.types';
import { Timer } from '../Shared/Timer';

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
  const [textAnswer, setTextAnswer] = useState('');
  
  // For Order Challenge
  const [orderedItems, setOrderedItems] = useState<OrderItem[]>([]);
  const [selectedOrderItem, setSelectedOrderItem] = useState<string | null>(null);
  
  // For Who and Who
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [matches, setMatches] = useState<Map<string, string>>(new Map()); // achievementId -> personId

  // Initialize order items when question changes
  useEffect(() => {
    if (question.orderItems) {
      // Shuffle the items for display
      const shuffled = [...question.orderItems].sort(() => Math.random() - 0.5);
      setOrderedItems(shuffled);
    }
    // Reset state on new question
    setAnswered(false);
    setSelectedAnswer(null);
    setTextAnswer('');
    setSelectedOrderItem(null);
    setSelectedPerson(null);
    setMatches(new Map());
  }, [question]);

  // Handle Four Options answer
  const handleOptionAnswer = (optionId: string) => {
    if (answered) return;
    
    setSelectedAnswer(optionId);
    setAnswered(true);

    if (question.options) {
      const option = question.options.find((opt) => opt.id === optionId);
      onAnswer(optionId, option?.isCorrect || false);
    }
  };

  // Handle Fill in the Blank answer
  const handleTextAnswer = () => {
    if (answered || !textAnswer.trim()) return;
    
    setAnswered(true);
    const isCorrect = textAnswer.trim().toLowerCase() === question.correctAnswer?.toLowerCase();
    onAnswer(textAnswer, isCorrect);
  };

  // Handle Order Challenge - move item
  const handleOrderItemClick = (itemId: string) => {
    if (answered) return;
    
    if (selectedOrderItem === null) {
      setSelectedOrderItem(itemId);
    } else {
      // Swap items
      const items = [...orderedItems];
      const index1 = items.findIndex(item => item.id === selectedOrderItem);
      const index2 = items.findIndex(item => item.id === itemId);
      
      if (index1 !== -1 && index2 !== -1) {
        [items[index1], items[index2]] = [items[index2], items[index1]];
        setOrderedItems(items);
      }
      setSelectedOrderItem(null);
    }
  };

  // Move item up/down in order
  const moveOrderItem = (index: number, direction: 'up' | 'down') => {
    if (answered) return;
    
    const items = [...orderedItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < items.length) {
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      setOrderedItems(items);
    }
  };

  // Submit Order Challenge answer
  const submitOrderAnswer = () => {
    if (answered) return;
    
    setAnswered(true);
    
    // Check if order is correct
    const isCorrect = orderedItems.every((item, index) => item.correctPosition === index + 1);
    onAnswer(orderedItems.map(i => i.id).join(','), isCorrect);
  };

  // Handle Who and Who - person selection
  const handlePersonClick = (person: Person) => {
    if (answered) return;
    setSelectedPerson(person);
  };

  // Handle Who and Who - achievement selection (creates match)
  const handleAchievementClick = (achievement: Achievement) => {
    if (answered || !selectedPerson) return;
    
    const newMatches = new Map(matches);
    
    // Remove this person from any previous matches
    newMatches.forEach((personId, achId) => {
      if (personId === selectedPerson.id) {
        newMatches.delete(achId);
      }
    });
    
    // Add new match
    newMatches.set(achievement.id, selectedPerson.id);
    setMatches(newMatches);
    setSelectedPerson(null);
  };

  // Submit Who and Who answer
  const submitWhoAndWhoAnswer = () => {
    if (answered || !question.whoAndWhoData) return;
    
    const { achievements } = question.whoAndWhoData;
    
    // Check if all achievements have matches
    if (matches.size !== achievements.length) {
      alert('يجب توصيل كل الإنجازات بالأشخاص');
      return;
    }
    
    setAnswered(true);
    
    // Check if all matches are correct
    const isCorrect = achievements.every(
      (achievement) => matches.get(achievement.id) === achievement.personId
    );
    
    onAnswer(JSON.stringify(Object.fromEntries(matches)), isCorrect);
  };

  // Get person name by id for display
  const getPersonName = (personId: string): string => {
    if (!question.whoAndWhoData) return '';
    return question.whoAndWhoData.people.find(p => p.id === personId)?.name || '';
  };

  // Render based on question type
  const renderQuestionContent = () => {
    switch (question.questionTypeId) {
      case 'fill-blank':
        return renderFillBlank();
      case 'four-options':
        return renderFourOptions();
      case 'order-challenge':
        return renderOrderChallenge();
      case 'who-and-who':
        return renderWhoAndWho();
      default:
        // Fallback to four options if type is unknown
        if (question.options && question.options.length > 0) {
          return renderFourOptions();
        }
        return renderFillBlank();
    }
  };

  // Fill in the Blank UI
  const renderFillBlank = () => (
    <div className="space-y-4">
      <div className="text-white text-lg mb-4">اكتب الإجابة الصحيحة:</div>
      <input
        type="text"
        value={textAnswer}
        onChange={(e) => setTextAnswer(e.target.value)}
        placeholder="اكتب إجابتك هنا..."
        className="w-full px-6 py-4 rounded-xl bg-white/20 text-white text-xl placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-center"
        dir="rtl"
        disabled={answered}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleTextAnswer();
          }
        }}
      />
      {!answered && (
        <button
          onClick={handleTextAnswer}
          disabled={!textAnswer.trim()}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          تأكيد الإجابة ✓
        </button>
      )}
      {answered && (
        <div className={`p-4 rounded-xl text-center text-xl font-bold ${
          textAnswer.trim().toLowerCase() === question.correctAnswer?.toLowerCase()
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {textAnswer.trim().toLowerCase() === question.correctAnswer?.toLowerCase()
            ? '✅ إجابة صحيحة!'
            : `❌ الإجابة الصحيحة: ${question.correctAnswer}`}
        </div>
      )}
    </div>
  );

  // Four Options UI
  const renderFourOptions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {question.options?.map((option, index) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.isCorrect;
        const showResult = answered;
        
        const colors = [
          'from-red-500 to-red-600',
          'from-blue-500 to-blue-600',
          'from-yellow-500 to-yellow-600',
          'from-green-500 to-green-600',
        ];

            return (
              <button
                key={option.id}
            onClick={() => handleOptionAnswer(option.id)}
                disabled={answered}
            className={`p-6 rounded-xl text-xl font-bold transition-all transform hover:scale-[1.02] ${
                  showResult
                    ? isCorrect
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white ring-4 ring-green-300'
                  : isSelected
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white ring-4 ring-red-300'
                  : 'bg-white/20 text-white/50'
                : isSelected
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white ring-4 ring-purple-300'
                : `bg-gradient-to-r ${colors[index % 4]} text-white hover:ring-2 hover:ring-white/50`
            } ${answered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="inline-block w-8 h-8 rounded-full bg-white/20 ml-3 text-center leading-8">
              {['أ', 'ب', 'ج', 'د'][index]}
            </span>
            {option.text}
          </button>
        );
      })}
    </div>
  );

  // Order Challenge UI
  const renderOrderChallenge = () => (
    <div className="space-y-4">
      <div className="text-white text-lg mb-4">رتب العناصر بالترتيب الصحيح (اضغط على عنصرين لتبديلهما):</div>
      <div className="space-y-3">
        {orderedItems.map((item, index) => {
          const isSelected = selectedOrderItem === item.id;
          const showCorrect = answered && item.correctPosition === index + 1;
          const showWrong = answered && item.correctPosition !== index + 1;
          
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                showCorrect
                      ? 'bg-green-600 text-white'
                  : showWrong
                  ? 'bg-red-600 text-white'
                    : isSelected
                  ? 'bg-purple-600 text-white ring-4 ring-purple-300'
                  : 'bg-white/20 text-white hover:bg-white/30'
              } ${answered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => handleOrderItemClick(item.id)}
            >
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                {index + 1}
              </span>
              <span className="flex-1 text-lg">{item.text}</span>
              {!answered && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveOrderItem(index, 'up'); }}
                    disabled={index === 0}
                    className="px-3 py-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveOrderItem(index, 'down'); }}
                    disabled={index === orderedItems.length - 1}
                    className="px-3 py-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!answered && (
        <button
          onClick={submitOrderAnswer}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          تأكيد الترتيب ✓
        </button>
      )}
    </div>
  );

  // Who and Who UI
  const renderWhoAndWho = () => {
    if (!question.whoAndWhoData) {
      return <div className="text-white">لا توجد بيانات لهذا السؤال</div>;
    }
    
    const { people, achievements } = question.whoAndWhoData;
    
    return (
      <div className="space-y-6">
        <div className="text-white text-lg mb-4">وصّل كل شخص بإنجازه الصحيح:</div>
        
        {/* People Section */}
        <div>
          <div className="text-white/70 text-sm mb-2">الأشخاص:</div>
          <div className="grid grid-cols-2 gap-4">
            {people.map((person) => {
              const isSelected = selectedPerson?.id === person.id;
              const isMatched = Array.from(matches.values()).includes(person.id);
              
              return (
                <button
                  key={person.id}
                  onClick={() => handlePersonClick(person)}
                  disabled={answered}
                  className={`p-4 rounded-xl transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? 'bg-purple-600 text-white ring-4 ring-purple-300'
                      : isMatched
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${answered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                  {person.imageUrl ? (
                    <img
                      src={person.imageUrl}
                      alt={person.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                  <span className="font-bold text-lg">{person.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Achievements Section */}
        <div>
          <div className="text-white/70 text-sm mb-2">الإنجازات:</div>
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const matchedPersonId = matches.get(achievement.id);
              const matchedPersonName = matchedPersonId ? getPersonName(matchedPersonId) : null;
              const isCorrect = answered && matchedPersonId === achievement.personId;
              const isWrong = answered && matchedPersonId && matchedPersonId !== achievement.personId;
              
              return (
                <button
                  key={achievement.id}
                  onClick={() => handleAchievementClick(achievement)}
                  disabled={answered || !selectedPerson}
                  className={`w-full p-4 rounded-xl transition-all text-right ${
                    isCorrect
                      ? 'bg-green-600 text-white'
                      : isWrong
                      ? 'bg-red-600 text-white'
                      : matchedPersonName
                      ? 'bg-blue-600 text-white'
                      : selectedPerson
                      ? 'bg-white/30 text-white hover:bg-white/40 ring-2 ring-yellow-400'
                      : 'bg-white/20 text-white'
                  } ${answered || !selectedPerson ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg">🏆 {achievement.text}</span>
                    {matchedPersonName && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        ← {matchedPersonName}
                      </span>
                    )}
                  </div>
                  {answered && isWrong && (
                    <div className="text-sm mt-2 opacity-80">
                      الصحيح: {getPersonName(achievement.personId)}
                    </div>
                  )}
              </button>
            );
          })}
        </div>
        </div>
        
        {!answered && matches.size === achievements.length && (
          <button
            onClick={submitWhoAndWhoAnswer}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            تأكيد الإجابة ✓
          </button>
        )}
        
        {!answered && selectedPerson && (
          <div className="text-center text-yellow-400 animate-pulse">
            اختر إنجاز {selectedPerson.name}
        </div>
      )}
    </div>
  );
};

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              question.difficulty === 'easy' ? 'bg-green-500/30 text-green-300' :
              question.difficulty === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
              'bg-red-500/30 text-red-300'
            }`}>
              {question.difficulty === 'easy' && '⭐ سهل'}
              {question.difficulty === 'medium' && '⭐⭐ متوسط'}
              {question.difficulty === 'hard' && '⭐⭐⭐ صعب'}
            </span>
            <span className="text-white/60 text-sm">
              {question.points} نقطة
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
            {question.text}
          </h2>
        </div>
        <Timer initialTime={timeLimit} onTimeUp={onTimeUp} paused={answered} />
      </div>

      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="Question"
          className="w-full max-w-md mx-auto mb-6 rounded-xl shadow-lg"
        />
      )}

      {renderQuestionContent()}
    </div>
  );
};
