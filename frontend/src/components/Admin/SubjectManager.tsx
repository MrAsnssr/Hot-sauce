import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Button } from '../Shared/Button';

interface Subject {
  _id: string;
  id?: string;
  name: string;
  nameAr: string;
  description?: string;
  color?: string;
}

export const SubjectManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    color: '#3b82f6',
  });

  // Load subjects on mount
  useEffect(() => {
    loadSubjects();
  }, []);

  // Load question counts when subjects change
  useEffect(() => {
    if (subjects.length > 0) {
      loadQuestionCounts();
    }
  }, [subjects]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subjects');
      // Normalize IDs
      const data = response.data.map((s: any) => ({
        ...s,
        id: s._id || s.id,
      }));
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      alert('فشل تحميل المواضيع');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionCounts = async () => {
    const counts: Record<string, number> = {};
    for (const subject of subjects) {
      try {
        const id = subject._id || subject.id;
        const response = await api.get(`/generate-questions/status/${id}`);
        counts[id!] = response.data.count || 0;
      } catch {
        counts[subject._id || subject.id!] = 0;
      }
    }
    setQuestionCounts(counts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.nameAr.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, formData);
        alert('تم تحديث الموضوع بنجاح');
      } else {
        await api.post('/subjects', formData);
        alert('تم إضافة الموضوع بنجاح');
      }
      resetForm();
      loadSubjects();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      alert('فشل حفظ الموضوع: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject._id || subject.id!);
    setFormData({
      name: subject.name,
      nameAr: subject.nameAr,
      description: subject.description || '',
      color: subject.color || '#3b82f6',
    });
    setShowForm(true);
  };

  const handleDelete = async (subject: Subject) => {
    const id = subject._id || subject.id;
    if (!id) {
      alert('خطأ: لم يتم العثور على معرف الموضوع');
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف "${subject.nameAr}"؟\nسيتم حذف جميع الأسئلة المرتبطة به.`)) {
      return;
    }

    try {
      await api.delete(`/subjects/${id}`);
      alert('تم حذف الموضوع بنجاح');
      loadSubjects();
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      alert('فشل حذف الموضوع: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleGenerateQuestions = async (subject: Subject) => {
    const id = subject._id || subject.id;
    if (!id) return;

    if (!confirm(`هل تريد إنشاء 10 أسئلة لكل نوع (60 سؤال إجمالي) لموضوع "${subject.nameAr}"؟`)) {
      return;
    }

    setGenerating(id);
    try {
      const response = await api.post('/generate-questions/generate', {
        subjectId: id,
        count: 10,
      });
      
      if (response.data.error) {
        alert('خطأ: ' + response.data.error);
      } else {
        alert('بدأ إنشاء الأسئلة! يرجى الانتظار...');
        // Poll for updates
        const pollInterval = setInterval(async () => {
          await loadQuestionCounts();
        }, 3000);
        
        setTimeout(() => {
          clearInterval(pollInterval);
          setGenerating(null);
          loadQuestionCounts();
        }, 60000); // Stop after 1 minute
      }
    } catch (error: any) {
      console.error('Error generating questions:', error);
      alert('فشل إنشاء الأسئلة: ' + (error.response?.data?.error || error.message));
      setGenerating(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', nameAr: '', description: '', color: '#3b82f6' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-6 text-white text-center">جاري التحميل...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">إدارة المواضيع</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'إلغاء' : '+ إضافة موضوع'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white mb-2">الاسم (إنجليزي) *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                placeholder="History"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2">الاسم (عربي) *</label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                dir="rtl"
                placeholder="التاريخ"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2">الوصف</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30"
                dir="rtl"
                placeholder="وصف اختياري..."
              />
            </div>
            <div>
              <label className="block text-white mb-2">اللون</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
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

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <div className="text-center text-white/60 py-12">
          <p className="text-xl mb-4">لا توجد مواضيع</p>
          <p>اضغط على "إضافة موضوع" لإنشاء موضوع جديد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const id = subject._id || subject.id;
            return (
              <div
                key={id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2"
                style={{ borderColor: subject.color || '#3b82f6' }}
              >
                <h3 className="text-xl font-bold text-white mb-1">{subject.nameAr}</h3>
                <p className="text-white/60 text-sm mb-2">{subject.name}</p>
                {subject.description && (
                  <p className="text-white/80 text-sm mb-3">{subject.description}</p>
                )}
                
                <div className="text-white/60 text-sm mb-3">
                  عدد الأسئلة: {questionCounts[id!] || 0}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleEdit(subject)} size="sm" variant="secondary">
                    تعديل
                  </Button>
                  <Button onClick={() => handleDelete(subject)} size="sm" variant="danger">
                    حذف
                  </Button>
                  <Button
                    onClick={() => handleGenerateQuestions(subject)}
                    size="sm"
                    variant="success"
                    disabled={generating === id}
                  >
                    {generating === id ? '⏳ جاري...' : '🤖 إنشاء أسئلة'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
