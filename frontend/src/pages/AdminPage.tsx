import React, { useState } from 'react';
import { QuestionManager } from '../components/Admin/QuestionManager';
import { SubjectManager } from '../components/Admin/SubjectManager';
import { QuestionTypeManager } from '../components/Admin/QuestionTypeManager';
import { Button } from '../components/Shared/Button';

type AdminTab = 'questions' | 'subjects' | 'types';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('questions');

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          لوحة تحكم الإدارة
        </h1>

        <div className="flex gap-2 justify-center mb-6">
          <Button
            variant={activeTab === 'questions' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('questions')}
          >
            الأسئلة
          </Button>
          <Button
            variant={activeTab === 'subjects' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('subjects')}
          >
            المواضيع
          </Button>
          <Button
            variant={activeTab === 'types' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('types')}
          >
            أنواع الأسئلة
          </Button>
        </div>

        {activeTab === 'questions' && <QuestionManager />}
        {activeTab === 'subjects' && <SubjectManager />}
        {activeTab === 'types' && <QuestionTypeManager />}
      </div>
    </div>
  );
};

export default AdminPage;

