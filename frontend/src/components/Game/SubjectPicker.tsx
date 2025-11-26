import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Subject } from '../../types/question.types';
import { Button } from '../Shared/Button';

interface SubjectPickerProps {
  onSelect: (subject: Subject) => void;
  selectedSubject?: Subject | null;
}

export const SubjectPicker: React.FC<SubjectPickerProps> = ({
  onSelect,
  selectedSubject,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">جاري التحميل...</div>;
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">اختر الموضوع</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject)}
            className={`p-4 rounded-lg transition-all ${
              selectedSubject?.id === subject.id
                ? 'bg-blue-600 text-white scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            style={{
              borderColor: subject.color,
              borderWidth: selectedSubject?.id === subject.id ? '3px' : '0px',
            }}
          >
            <div className="font-bold text-lg">{subject.nameAr}</div>
            {subject.description && (
              <div className="text-sm mt-1 opacity-80">{subject.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

