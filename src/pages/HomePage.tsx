import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showSauceInfo, setShowSauceInfo] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [questionCount, setQuestionCount] = useState(0);

  // Check API connection on mount
  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await api.get('/health');
        if (res.data?.status === 'ok') {
          setApiStatus('ok');
          // Also check question count
          const qRes = await api.get('/questions');
          setQuestionCount(qRes.data?.length || 0);
        } else {
          setApiStatus('error');
        }
      } catch (e) {
        console.error('API check failed:', e);
        setApiStatus('error');
      }
    };
    checkApi();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin' || adminPassword === '') {
      navigate('/admin');
    } else {
      alert('كلمة المرور غير صحيحة');
    }
    setAdminPassword('');
    setShowAdminLogin(false);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          linear-gradient(180deg, rgba(139,90,43,0.95) 0%, rgba(101,67,33,1) 50%, rgba(80,50,20,1) 100%),
          repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.03) 50px, rgba(0,0,0,0.03) 100px)
        `,
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Wood grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.1) 2px,
              rgba(0,0,0,0.1) 4px
            )
          `,
        }}
      />

      {/* API Status Indicator */}
      <div className="absolute bottom-4 left-4 z-20 text-xs">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          apiStatus === 'ok' ? 'bg-green-600' : 
          apiStatus === 'error' ? 'bg-red-600' : 'bg-yellow-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            apiStatus === 'ok' ? 'bg-green-300' : 
            apiStatus === 'error' ? 'bg-red-300' : 'bg-yellow-300 animate-pulse'
          }`} />
          <span className="text-white">
            {apiStatus === 'ok' ? `متصل (${questionCount} سؤال)` : 
             apiStatus === 'error' ? 'غير متصل' : 'جاري الاتصال...'}
          </span>
        </div>
      </div>

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 left-4 w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-yellow-600 z-20 transition-transform hover:scale-110"
      >
        ?
      </button>

      {/* Settings Button */}
      <button
        onClick={() => setShowAdminLogin(true)}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 flex items-center justify-center text-xl text-white shadow-lg border-4 border-orange-700 z-20 transition-transform hover:scale-110"
      >
        ⚙️
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {/* Sauce drop */}
            <div 
              className="w-20 h-28 mx-auto mb-2"
              style={{
                background: 'linear-gradient(180deg, #ff6b6b 0%, #c92a2a 50%, #8b0000 100%)',
                borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
                boxShadow: '0 4px 15px rgba(139, 0, 0, 0.5)',
              }}
            />
            <h1 
              className="text-5xl font-bold"
              style={{
                color: '#ff6b6b',
                textShadow: '2px 2px 0 #8b0000, 4px 4px 8px rgba(0,0,0,0.3)',
                fontFamily: 'Arial Black, sans-serif',
              }}
            >
              Extra
            </h1>
            <h2 
              className="text-6xl font-bold -mt-2"
              style={{
                color: '#c92a2a',
                textShadow: '2px 2px 0 #5a0000, 4px 4px 8px rgba(0,0,0,0.3)',
                fontFamily: 'Arial Black, sans-serif',
              }}
            >
              Sauce
            </h2>
          </div>
        </div>

        {/* Main Menu Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 max-w-4xl">
          {/* Local Game - طبق مشترك */}
          <button
            onClick={() => navigate('/local/setup')}
            className="group relative bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 rounded-2xl p-4 shadow-xl border-4 border-green-700 transition-all hover:scale-105 hover:-translate-y-1 w-[180px]"
          >
            <div className="text-6xl mb-2">🍽️</div>
            <div className="text-white font-bold text-xl mb-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              طبق مشترك
            </div>
            <div className="text-green-100 text-sm">ابدأ طبخة جديدة!</div>
          </button>

          {/* Online Game - وليمة جماعية */}
          <button
            onClick={() => navigate('/online/create')}
            className="group relative bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 rounded-2xl p-4 shadow-xl border-4 border-green-700 transition-all hover:scale-105 hover:-translate-y-1 w-[200px]"
          >
            <div className="text-6xl mb-2">🍝</div>
            <div className="text-white font-bold text-xl mb-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              وليمة جماعية
            </div>
            <div className="text-green-100 text-sm">أقم وليمة أونلاين!</div>
          </button>

          {/* Question Bank - قائمة الوصفات */}
          <button
            onClick={() => navigate('/admin')}
            className="group relative bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 rounded-2xl p-4 shadow-xl border-4 border-green-700 transition-all hover:scale-105 hover:-translate-y-1 w-[180px]"
          >
            <div className="text-6xl mb-2">📖</div>
            <div className="text-white font-bold text-xl mb-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              قائمة الوصفات
            </div>
            <div className="text-green-100 text-sm">تصفح قائمة الوصفات</div>
          </button>
        </div>

        {/* Bottom Buttons */}
        <div className="flex gap-8">
          {/* Secret Sauce - خلطة الصوص السري */}
          <button
            onClick={() => setShowSauceInfo(true)}
            className="flex items-center gap-3 text-white hover:text-yellow-300 transition-colors"
          >
            <div className="text-3xl">🍲</div>
            <div className="text-right">
              <div className="font-bold text-lg">خلطة الصوص السري</div>
              <div className="text-sm opacity-80">ما هو الصوص الإضافي؟</div>
            </div>
          </button>

          {/* Game Chefs - طهاة اللعبة */}
          <button
            onClick={() => setShowAdminLogin(true)}
            className="flex items-center gap-3 text-white hover:text-yellow-300 transition-colors"
          >
            <div className="text-3xl">👨‍🍳</div>
            <div className="text-right">
              <div className="font-bold text-lg">طهاة اللعبة</div>
              <div className="text-sm opacity-80">تعرف على طهاة اللعبة</div>
            </div>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-amber-100 rounded-2xl p-6 max-w-md w-full border-4 border-amber-800 shadow-2xl">
            <h3 className="text-2xl font-bold text-amber-900 mb-4 text-center">كيف تلعب؟</h3>
            <div className="text-amber-800 space-y-3 text-right">
              <p><strong>🍽️ طبق مشترك:</strong> لعبة محلية - الجميع على نفس الشاشة</p>
              <p><strong>🍝 وليمة جماعية:</strong> لعبة أونلاين - شارك الرابط مع أصدقائك</p>
              <p><strong>📖 قائمة الوصفات:</strong> إدارة الأسئلة والمواضيع</p>
              <p><strong>🌶️ الصوص الإضافي:</strong> قوى خارقة وتحديات تضيف نكهة للعبة!</p>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg"
            >
              فهمت!
            </button>
          </div>
        </div>
      )}

      {/* Sauce Info Modal */}
      {showSauceInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-red-100 rounded-2xl p-6 max-w-md w-full border-4 border-red-800 shadow-2xl">
            <h3 className="text-2xl font-bold text-red-900 mb-4 text-center">🌶️ الصوص الإضافي</h3>
            <div className="text-red-800 space-y-3 text-right">
              <p className="font-bold text-green-700">قوى خارقة ⚡:</p>
              <ul className="mr-4 text-sm space-y-1">
                <li>• +10 ثواني إضافية</li>
                <li>• حذف خيار خاطئ</li>
                <li>• مضاعفة النقاط</li>
                <li>• سرقة نقطة من الخصم</li>
              </ul>
              <p className="font-bold text-red-700">صلصات سلبية 🔥:</p>
              <ul className="mr-4 text-sm space-y-1">
                <li>• −10 ثواني</li>
                <li>• سؤال أصعب</li>
                <li>• إجابة بدون خيارات</li>
                <li>• خصم نقطة</li>
              </ul>
            </div>
            <button
              onClick={() => setShowSauceInfo(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg"
            >
              يمّي! 🤤
            </button>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-orange-100 rounded-2xl p-6 max-w-sm w-full border-4 border-orange-800 shadow-2xl">
            <h3 className="text-2xl font-bold text-orange-900 mb-4 text-center">👨‍🍳 دخول المطبخ</h3>
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="كلمة السر"
                className="w-full px-4 py-2 rounded-lg border-2 border-orange-300 mb-4 text-center"
                dir="rtl"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-lg"
                >
                  ادخل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }}
                  className="flex-1 bg-gray-400 hover:bg-gray-300 text-white font-bold py-2 rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
