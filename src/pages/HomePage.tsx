import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold text-white mb-4">
          لعبة التريفا العربية
        </h1>
        <p className="text-2xl text-blue-200 mb-8">
          Arabic Trivia Game with Extra Sauce
        </p>

        <div className="space-y-4">
          <Link
            to="/local/setup"
            className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200"
          >
            لعب محلي (Local Game)
          </Link>

          <Link
            to="/online/create"
            className="block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200"
          >
            إنشاء غرفة عبر الإنترنت (Create Online Room)
          </Link>

          <Link
            to="/online/join"
            className="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200"
          >
            الانضمام إلى غرفة (Join Online Room)
          </Link>

          <Link
            to="/admin"
            className="block bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200"
          >
            لوحة التحكم (Admin Panel)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
