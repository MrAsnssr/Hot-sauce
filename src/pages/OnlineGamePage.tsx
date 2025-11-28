import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Question {
  _id: string;
  question: string;
  questionAr: string;
  options: string[];
  optionsAr: string[];
  correctAnswer: number;
  subject: string;
  type: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

const OnlineGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);

  // Mock questions for demonstration
  const mockQuestions: Question[] = [
    {
      _id: '1',
      question: 'What is the capital of France?',
      questionAr: 'ما هي عاصمة فرنسا؟',
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      optionsAr: ['لندن', 'باريس', 'برلين', 'مدريد'],
      correctAnswer: 1,
      subject: 'Geography',
      type: 'Multiple Choice'
    },
    {
      _id: '2',
      question: 'Which planet is known as the Red Planet?',
      questionAr: 'أي كوكب يُعرف باسم الكوكب الأحمر؟',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      optionsAr: ['الزهرة', 'المريخ', 'المشتري', 'زحل'],
      correctAnswer: 1,
      subject: 'Science',
      type: 'Multiple Choice'
    }
  ];

  // Mock players
  useEffect(() => {
    const mockPlayers: Player[] = [
      { id: '1', name: localStorage.getItem('hostName') || 'المضيف', score: 25, isHost: true },
      { id: '2', name: 'لاعب 1', score: 15, isHost: false },
      { id: '3', name: 'لاعب 2', score: 20, isHost: false },
    ];
    setPlayers(mockPlayers);
  }, []);

  useEffect(() => {
    if (!gameStarted) {
      setCurrentQuestion(mockQuestions[0]);
      setGameStarted(true);
    }
  }, [gameStarted]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult]);

  const handleTimeUp = () => {
    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);

    // Update score if correct
    if (selectedAnswer === currentQuestion?.correctAnswer) {
      setPlayers(prev => prev.map(player =>
        player.id === '1' ? { ...player, score: player.score + 10 } : player
      ));
    }

    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);

    const currentIndex = mockQuestions.findIndex(q => q._id === currentQuestion?._id);
    if (currentIndex < mockQuestions.length - 1) {
      setCurrentQuestion(mockQuestions[currentIndex + 1]);
    } else {
      // Game over
      alert('اللعبة انتهت! شكراً للمشاركة.');
      navigate('/');
    }
  };

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">جاري تحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with timer and scores */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <div className="text-3xl font-bold">
              {timeLeft}
            </div>
            <div className="text-sm">ثانية متبقية</div>
          </div>

          <div className="text-center">
            <h2 className="text-white text-2xl font-bold">اللعبة جارية</h2>
          </div>

          <div className="text-right">
            <div className="text-white text-sm">اللاعبون</div>
            <div className="space-y-1">
              {players.slice(0, 3).map(player => (
                <div key={player.id} className="text-white text-sm">
                  {player.name}: {player.score}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {currentQuestion.subject}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
            {currentQuestion.questionAr}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.optionsAr.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`p-4 rounded-lg text-left transition-all duration-200 ${
                  selectedAnswer === index
                    ? showResult
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white'
                    : showResult && index === currentQuestion.correctAnswer
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          {selectedAnswer !== null && !showResult && (
            <div className="text-center mt-6">
              <button
                onClick={handleSubmitAnswer}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
              >
                تأكيد الإجابة
              </button>
            </div>
          )}

          {showResult && (
            <div className="text-center mt-6">
              <p className="text-xl font-bold text-green-600">
                {selectedAnswer === currentQuestion.correctAnswer ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة 😞'}
              </p>
              <p className="text-gray-600 mt-2">
                الإجابة الصحيحة: {currentQuestion.optionsAr[currentQuestion.correctAnswer]}
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            العودة للقائمة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineGamePage;