import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'questions' | 'subjects' | 'types'>('questions');

  const tabs = [
    { id: 'questions', label: 'الأسئلة', labelEn: 'Questions' },
    { id: 'subjects', label: 'المواضيع', labelEn: 'Subjects' },
    { id: 'types', label: 'أنواع الأسئلة', labelEn: 'Question Types' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              لوحة تحكم المدير
            </h1>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'questions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">إدارة الأسئلة</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  إضافة سؤال جديد
                </button>
              </div>

              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">لا توجد أسئلة بعد</p>
                <p className="text-sm text-gray-400">
                  هذه نسخة تجريبية - في التطبيق الكامل ستتمكن من إضافة وتعديل الأسئلة
                </p>
              </div>

              {/* Mock questions list */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">ما هي عاصمة فرنسا؟</h3>
                  <p className="text-sm text-gray-600">المادة: الجغرافيا | النوع: اختيار متعدد</p>
                  <div className="flex space-x-2 mt-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">تعديل</button>
                    <button className="text-red-600 hover:text-red-800 text-sm">حذف</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">إدارة المواضيع</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  إضافة موضوع جديد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['التاريخ', 'العلوم', 'الرياضيات', 'الأدب', 'الجغرافيا', 'الرياضة'].map((subject) => (
                  <div key={subject} className="border rounded-lg p-4">
                    <h3 className="font-medium">{subject}</h3>
                    <div className="flex space-x-2 mt-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">تعديل</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'types' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">إدارة أنواع الأسئلة</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  إضافة نوع جديد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'اختيار متعدد', nameEn: 'Multiple Choice' },
                  { name: 'صح/خطأ', nameEn: 'True/False' },
                  { name: 'إكمال جملة', nameEn: 'Fill in the Blank' }
                ].map((type) => (
                  <div key={type.name} className="border rounded-lg p-4">
                    <h3 className="font-medium">{type.name}</h3>
                    <p className="text-sm text-gray-600">{type.nameEn}</p>
                    <div className="flex space-x-2 mt-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">تعديل</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
