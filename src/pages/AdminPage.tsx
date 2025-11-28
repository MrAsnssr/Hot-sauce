import React, { useState } from 'react';
import { QuestionManager } from '../components/Admin/QuestionManager';
import { SubjectManager } from '../components/Admin/SubjectManager';
import { QuestionTypeManager } from '../components/Admin/QuestionTypeManager';
import { QuestionConverter } from '../components/Admin/QuestionConverter';
import { Button } from '../components/Shared/Button';
import { WoodyBackground } from '../components/Shared/WoodyBackground';

type AdminTab = 'questions' | 'subjects' | 'types' | 'converter';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('questions');

  return (
    <WoodyBackground>
      <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          لوحة تحكم الإدارة
        </h1>

        <div className="flex gap-2 justify-center mb-6 flex-wrap">
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
          <Button
            variant={activeTab === 'converter' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('converter')}
          >
            محول الأسئلة
          </Button>
        </div>

        {activeTab === 'questions' && <QuestionManager />}
        {activeTab === 'subjects' && <SubjectManager />}
        {activeTab === 'types' && <QuestionTypeManager />}
        {activeTab === 'converter' && <QuestionConverter />}
      </div>
      </div>
    </WoodyBackground>
  );
};

export default AdminPage;

