import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Button } from '../Shared/Button';
import { HARDCODED_QUESTION_TYPES } from '../../constants/questionTypes';

interface Subject {
  _id: string;
  id?: string;
  name: string;
  nameAr: string;
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  id?: string;
  text: string;
  subjectId: any;
  questionTypeId: string;
  options: QuestionOption[];
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
}

export const QuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]); // Store all questions
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  const [formData, setFormData] = useState({
    text: '',
    subjectId: '',
    questionTypeId: 'multiple-choice',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    points: 10,
    timeLimit: 30,
    options: [
      { id: 'opt-0', text: '', isCorrect: true },
      { id: 'opt-1', text: '', isCorrect: false },
      { id: 'opt-2', text: '', isCorrect: false },
      { id: 'opt-3', text: '', isCorrect: false },
    ] as QuestionOption[],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [filterSubject]);

  // Apply filters whenever questions or filters change
  useEffect(() => {
    applyFilters();
  }, [allQuestions, filterSubject, filterType, filterDifficulty]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsRes] = await Promise.all([
        api.get('/subjects'),
      ]);
      
      const subjectsData = subjectsRes.data.map((s: any) => ({
        ...s,
        id: s._id || s.id,
      }));
      setSubjects(subjectsData);
      
      await loadQuestions();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      // Always load all questions, we'll filter client-side
      const response = await api.get('/questions');
      setAllQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...allQuestions];

    // Filter by subject
    if (filterSubject) {
      filtered = filtered.filter(q => {
        const subjectId = typeof q.subjectId === 'object' ? q.subjectId._id : q.subjectId;
        return subjectId === filterSubject;
      });
    }

    // Filter by question type
    if (filterType) {
      filtered = filtered.filter(q => q.questionTypeId === filterType);
    }

    // Filter by difficulty
    if (filterDifficulty) {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }

    setFilteredQuestions(filtered);
    setQuestions(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      alert('يرجى إدخال نص السؤال');
      return;
    }

    if (!formData.subjectId) {
      alert('يرجى اختيار الموضوع');
      return;
    }

    // Validate options
    const filledOptions = formData.options.filter(o => o.text.trim());
    if (filledOptions.length < 2) {
      alert('يرجى إدخال خيارين على الأقل');
      return;
    }

    const hasCorrect = formData.options.some(o => o.isCorrect && o.text.trim());
    if (!hasCorrect) {
      alert('يرجى تحديد إجابة صحيحة واحدة على الأقل');
      return;
    }

    const questionData = {
      text: formData.text,
      subjectId: formData.subjectId,
      questionTypeId: formData.questionTypeId,
      difficulty: formData.difficulty,
      points: formData.points,
      timeLimit: formData.timeLimit,
      options: formData.options.filter(o => o.text.trim()),
    };

    try {
      if (editingId) {
        await api.put(`/questions/${editingId}`, questionData);
        alert('تم تحديث السؤال بنجاح');
      } else {
        await api.post('/questions', questionData);
        alert('تم إضافة السؤال بنجاح');
      }
      resetForm();
      loadQuestions();
    } catch (error: any) {
      console.error('Error saving question:', error);
      alert('فشل حفظ السؤال: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (question: Question) => {
    const id = question._id || question.id;
    setEditingId(id!);
    
    // Ensure we have 4 options
    const options = [...(question.options || [])];
    while (options.length < 4) {
      options.push({ id: `opt-${options.length}`, text: '', isCorrect: false });
    }

    setFormData({
      text: question.text,
      subjectId: typeof question.subjectId === 'object' ? question.subjectId._id : question.subjectId,
      questionTypeId: question.questionTypeId || 'multiple-choice',
      difficulty: question.difficulty || 'medium',
      points: question.points || 10,
      timeLimit: question.timeLimit || 30,
      options: options,
    });
    setShowForm(true);
  };

  const handleDelete = async (question: Question) => {
    const id = question._id || question.id;
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

    try {
      await api.delete(`/questions/${id}`);
      alert('تم حذف السؤال بنجاح');
      loadQuestions();
    } catch (error: any) {
      console.error('Error deleting question:', error);
      alert('فشل حذف السؤال');
    }
  };

  const handleDeleteAllFiltered = async () => {
    if (filteredQuestions.length === 0) {
      alert('لا توجد أسئلة محفوظة للحذف');
      return;
    }

    const confirmMessage = `هل أنت متأكد من حذف جميع الأسئلة المحفوظة (${filteredQuestions.length} سؤال)؟\n\nهذه العملية لا يمكن التراجع عنها!`;
    if (!confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const deletePromises = filteredQuestions.map(q => {
        const id = q._id || q.id;
        return api.delete(`/questions/${id}`);
      });

      await Promise.all(deletePromises);
      alert(`✅ تم حذف ${filteredQuestions.length} سؤال بنجاح`);
      loadQuestions();
      
      // Reset filters
      setFilterSubject('');
      setFilterType('');
      setFilterDifficulty('');
    } catch (error: any) {
      console.error('Error deleting questions:', error);
      alert('حدث خطأ أثناء حذف بعض الأسئلة');
      loadQuestions(); // Reload to see what was actually deleted
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = () => {
    return !!(filterSubject || filterType || filterDifficulty);
  };

  const updateOption = (index: number, field: 'text' | 'isCorrect', value: any) => {
    const newOptions = [...formData.options];
    
    if (field === 'isCorrect' && value === true) {
      // Uncheck all others
      newOptions.forEach((o, i) => {
        o.isCorrect = i === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    
    setFormData({ ...formData, options: newOptions });
  };

  const resetForm = () => {
    setFormData({
      text: '',
      subjectId: '',
      questionTypeId: 'multiple-choice',
      difficulty: 'medium',
      points: 10,
      timeLimit: 30,
      options: [
        { id: 'opt-0', text: '', isCorrect: true },
        { id: 'opt-1', text: '', isCorrect: false },
        { id: 'opt-2', text: '', isCorrect: false },
        { id: 'opt-3', text: '', isCorrect: false },
      ],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getSubjectName = (subjectId: any) => {
    if (typeof subjectId === 'object' && subjectId?.nameAr) {
      return subjectId.nameAr;
    }
    const subject = subjects.find(s => (s._id || s.id) === subjectId);
    return subject?.nameAr || 'غير معروف';
  };

  const getTypeName = (typeId: string) => {
    const type = HARDCODED_QUESTION_TYPES.find(t => t.id === typeId);
    return type?.nameAr || typeId;
  };

  if (loading) {
    return <div className="p-6 text-white text-center">جاري التحميل...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">إدارة الأسئلة</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'إلغاء' : '+ إضافة سؤال'}
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">تصفية الأسئلة</h3>
          {hasActiveFilters() && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAllFiltered}
              disabled={loading || filteredQuestions.length === 0}
            >
              🗑️ حذف جميع الأسئلة المحفوظة ({filteredQuestions.length})
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white mb-2 text-sm">الموضوع:</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
            >
              <option value="">جميع المواضيع</option>
              {subjects.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2 text-sm">نوع السؤال:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
            >
              <option value="">جميع الأنواع</option>
              {HARDCODED_QUESTION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2 text-sm">الصعوبة:</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
            >
              <option value="">جميع المستويات</option>
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">صعب</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-white/80 text-sm">
            <span className="font-bold">النتائج:</span> {questions.length} من {allQuestions.length} سؤال
            {hasActiveFilters() && (
              <span className="mr-2 text-yellow-300">
                (محفوظة)
              </span>
            )}
          </div>
          {hasActiveFilters() && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFilterSubject('');
                setFilterType('');
                setFilterDifficulty('');
              }}
            >
              إزالة جميع التصفيات
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-white mb-2">نص السؤال *</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                dir="rtl"
                rows={3}
                placeholder="أدخل نص السؤال هنا..."
                required
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">الموضوع *</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                required
              >
                <option value="">اختر الموضوع</option>
                {subjects.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
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
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
              >
                {HARDCODED_QUESTION_TYPES.map((t) => (
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
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
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
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 10 })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                min="1"
              />
            </div>
          </div>

          {/* Options */}
          <div className="mb-4">
            <label className="block text-white mb-2">الخيارات (حدد الإجابة الصحيحة)</label>
            <div className="space-y-2">
              {formData.options.map((opt, index) => (
                <div key={opt.id} className="flex gap-2 items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={opt.isCorrect}
                    onChange={() => updateOption(index, 'isCorrect', true)}
                    className="w-5 h-5"
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                    dir="rtl"
                    placeholder={`الخيار ${index + 1}`}
                  />
                  {opt.isCorrect && (
                    <span className="text-green-400 text-sm">✓ صحيح</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="success">
              {editingId ? 'تحديث' : 'إضافة'}
            </Button>
            <Button type="button" onClick={resetForm} variant="secondary">
              إلغاء
            </Button>
          </div>
        </form>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center text-white/60 py-12">
          <p className="text-xl mb-4">لا توجد أسئلة</p>
          <p>اضغط على "إضافة سؤال" لإنشاء سؤال جديد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => {
            const id = question._id || question.id;
            return (
              <div
                key={id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white flex-1">{question.text}</h3>
                  <div className="flex gap-2 mr-4">
                    <Button onClick={() => handleEdit(question)} size="sm" variant="secondary">
                      تعديل
                    </Button>
                    <Button onClick={() => handleDelete(question)} size="sm" variant="danger">
                      حذف
                    </Button>
                  </div>
                </div>
                
                <div className="text-white/60 text-sm mb-2">
                  {getSubjectName(question.subjectId)} • {getTypeName(question.questionTypeId)} • 
                  {question.difficulty === 'easy' ? ' سهل' : question.difficulty === 'hard' ? ' صعب' : ' متوسط'} • 
                  {question.points} نقطة
                </div>
                
                {question.options && question.options.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((opt, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-sm ${
                          opt.isCorrect 
                            ? 'bg-green-600 text-white' 
                            : 'bg-white/20 text-white/80'
                        }`}
                      >
                        {opt.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
