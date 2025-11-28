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

const LocalGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [team1Name] = useState(localStorage.getItem('team1Name') || 'فريق 1');
  const [team2Name] = useState(localStorage.getItem('team2Name') || 'فريق 2');
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
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

  useEffect(() => {
    if (!gameStarted) {
      setCurrentQuestion(mockQuestions[0]);
      setGameStarted(true);
    }
  }, [gameStarted]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);

    setTimeout(() => {
      if (selectedAnswer === currentQuestion?.correctAnswer) {
        if (currentTeam === 1) {
          setTeam1Score(prev => prev + 10);
        } else {
          setTeam2Score(prev => prev + 10);
        }
      }

      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentTeam(currentTeam === 1 ? 2 : 1);

      // Move to next question or end game
      const currentIndex = mockQuestions.findIndex(q => q._id === currentQuestion?._id);
      if (currentIndex < mockQuestions.length - 1) {
        setCurrentQuestion(mockQuestions[currentIndex + 1]);
      } else {
        // Game over - could show results
        alert(`اللعبة انتهت!\n${team1Name}: ${team1Score}\n${team2Name}: ${team2Score}`);
        navigate('/');
      }
    }, 2000);
  };

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">جاري تحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Scores */}
        <div className="flex justify-between items-center mb-6">
          <div className={`text-center p-4 rounded-lg ${currentTeam === 1 ? 'bg-blue-600' : 'bg-blue-800'}`}>
            <h3 className="text-white font-bold text-xl">{team1Name}</h3>
            <p className="text-white text-2xl">{team1Score}</p>
          </div>

          <div className="text-center">
            <h2 className="text-white text-2xl font-bold">دور {currentTeam === 1 ? team1Name : team2Name}</h2>
          </div>

          <div className={`text-center p-4 rounded-lg ${currentTeam === 2 ? 'bg-red-600' : 'bg-red-800'}`}>
            <h3 className="text-white font-bold text-xl">{team2Name}</h3>
            <p className="text-white text-2xl">{team2Score}</p>
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

export default LocalGamePage;