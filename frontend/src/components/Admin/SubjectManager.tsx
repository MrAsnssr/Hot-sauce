import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Subject } from '../../types/question.types';
import { Button } from '../Shared/Button';

interface GenerationStatus {
  [key: string]: {
    generating: boolean;
    count: number;
  };
}

export const SubjectManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    color: '#3b82f6',
  });
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({});
  const [questionCounts, setQuestionCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjects.length > 0) {
      fetchQuestionCounts();
      // Poll for question counts every 5 seconds
      const interval = setInterval(fetchQuestionCounts, 5000);
      return () => clearInterval(interval);
    }
  }, [subjects]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchQuestionCounts = async () => {
    try {
      const counts: { [key: string]: number } = {};
      for (const subject of subjects) {
        try {
          const response = await api.get(`/generate-questions/status/${subject.id}`);
          counts[subject.id] = response.data.count || 0;
        } catch (error) {
          counts[subject.id] = 0;
        }
      }
      setQuestionCounts(counts);
    } catch (error) {
      console.error('Error fetching question counts:', error);
    }
  };

  const generateQuestions = async (subjectId: string) => {
    if (!confirm('هل تريد إنشاء 1000 سؤال لهذا الموضوع؟ قد يستغرق هذا بعض الوقت.')) {
      return;
    }

    setGenerationStatus((prev) => ({
      ...prev,
      [subjectId]: { generating: true, count: 0 },
    }));

    try {
      await api.post('/generate-questions/generate', {
        subjectId,
        count: 1000,
      });
      
      // Start polling for updates
      const pollInterval = setInterval(async () => {
        try {
          const response = await api.get(`/generate-questions/status/${subjectId}`);
          const count = response.data.count || 0;
          setQuestionCounts((prev) => ({ ...prev, [subjectId]: count }));
          
          if (count >= 1000) {
            clearInterval(pollInterval);
            setGenerationStatus((prev) => ({
              ...prev,
              [subjectId]: { generating: false, count },
            }));
          }
        } catch (error) {
          console.error('Error polling status:', error);
        }
      }, 3000);

      // Stop polling after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setGenerationStatus((prev) => ({
          ...prev,
          [subjectId]: { generating: false, count: questionCounts[subjectId] || 0 },
        }));
      }, 600000);
    } catch (error: any) {
      console.error('Error generating questions:', error);
      alert('فشل إنشاء الأسئلة: ' + (error.response?.data?.error || error.message));
      setGenerationStatus((prev) => ({
        ...prev,
        [subjectId]: { generating: false, count: 0 },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, formData);
      } else {
        await api.post('/subjects', formData);
      }
      await fetchSubjects();
      resetForm();
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      nameAr: subject.nameAr,
      description: subject.description || '',
      color: subject.color || '#3b82f6',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموضوع؟')) {
      try {
        await api.delete(`/subjects/${id}`);
        await fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      color: '#3b82f6',
    });
    setEditingSubject(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">إدارة المواضيع</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'إلغاء' : 'إضافة موضوع جديد'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white mb-2">الاسم (إنجليزي)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2">الاسم (عربي)</label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
                dir="rtl"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2">الوصف</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-white mb-2">اللون</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="success">
              {editingSubject ? 'تحديث' : 'إضافة'}
            </Button>
            <Button type="button" onClick={resetForm} variant="secondary">
              إلغاء
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            style={{ borderColor: subject.color, borderWidth: '3px' }}
          >
            <h3 className="text-xl font-bold text-white mb-2">{subject.nameAr}</h3>
            {subject.description && (
              <p className="text-white/80 mb-4">{subject.description}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => handleEdit(subject)} size="sm" variant="secondary">
                تعديل
              </Button>
              <Button
                onClick={() => handleDelete(subject.id)}
                size="sm"
                variant="danger"
              >
                حذف
              </Button>
              <Button
                onClick={() => generateQuestions(subject.id)}
                size="sm"
                variant="success"
                disabled={generationStatus[subject.id]?.generating}
              >
                {generationStatus[subject.id]?.generating
                  ? 'جاري الإنشاء...'
                  : 'إنشاء 1000 سؤال (ChatGPT)'}
              </Button>
            </div>
            <div className="mt-2 text-sm text-white/60">
              عدد الأسئلة: {questionCounts[subject.id] || 0}
              {generationStatus[subject.id]?.generating && (
                <span className="text-yellow-400 mr-2"> ⏳ جاري الإنشاء...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

