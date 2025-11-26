import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Question, Subject, QuestionType } from '../../types/question.types';
import { Button } from '../Shared/Button';

export const QuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    subjectId: '',
    questionTypeId: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    points: 10,
    timeLimit: 30,
    options: [] as Array<{ id: string; text: string; isCorrect: boolean }>,
    correctAnswer: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsRes, subjectsRes, typesRes] = await Promise.all([
        api.get('/questions'),
        api.get('/subjects'),
        api.get('/question-types'),
      ]);
      setQuestions(questionsRes.data);
      setSubjects(subjectsRes.data);
      setQuestionTypes(typesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await api.put(`/questions/${editingQuestion.id}`, formData);
      } else {
        await api.post('/questions', formData);
      }
      await fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      subjectId: question.subjectId.toString(),
      questionTypeId: question.questionTypeId.toString(),
      difficulty: question.difficulty,
      points: question.points,
      timeLimit: question.timeLimit,
      options: question.options || [],
      correctAnswer: question.correctAnswer || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      try {
        await api.delete(`/questions/${id}`);
        await fetchData();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      subjectId: '',
      questionTypeId: '',
      difficulty: 'medium',
      points: 10,
      timeLimit: 30,
      options: [],
      correctAnswer: '',
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        { id: `opt-${Date.now()}`, text: '', isCorrect: false },
      ],
    });
  };

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">إدارة الأسئلة</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'إلغاء' : 'إضافة سؤال جديد'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white mb-2">نص السؤال</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60"
                dir="rtl"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2">الموضوع</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
                required
              >
                <option value="">اختر الموضوع</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white mb-2">نوع السؤال</label>
              <select
                value={formData.questionTypeId}
                onChange={(e) => setFormData({ ...formData, questionTypeId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
                required
              >
                <option value="">اختر النوع</option>
                {questionTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white mb-2">الصعوبة</label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value as any })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
              >
                <option value="easy">سهل</option>
                <option value="medium">متوسط</option>
                <option value="hard">صعب</option>
              </select>
            </div>
            <div>
              <label className="block text-white mb-2">النقاط</label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-white mb-2">الوقت (ثانية)</label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) =>
                  setFormData({ ...formData, timeLimit: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
                min="5"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-white">الخيارات</label>
              <Button type="button" onClick={addOption} size="sm">
                إضافة خيار
              </Button>
            </div>
            {formData.options.map((opt, index) => (
              <div key={opt.id} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                  placeholder="نص الخيار"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white"
                  dir="rtl"
                />
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={opt.isCorrect}
                    onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                    className="ml-2"
                  />
                  صحيح
                </label>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="success">
              {editingQuestion ? 'تحديث' : 'إضافة'}
            </Button>
            <Button type="button" onClick={resetForm} variant="secondary">
              إلغاء
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex justify-between items-start"
          >
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{question.text}</h3>
              <div className="text-white/80 text-sm">
                {subjects.find((s) => s.id === question.subjectId)?.nameAr} -{' '}
                {questionTypes.find((t) => t.id === question.questionTypeId)?.nameAr} -{' '}
                {question.difficulty} - {question.points} نقطة
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleEdit(question)} size="sm" variant="secondary">
                تعديل
              </Button>
              <Button
                onClick={() => handleDelete(question.id)}
                size="sm"
                variant="danger"
              >
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

