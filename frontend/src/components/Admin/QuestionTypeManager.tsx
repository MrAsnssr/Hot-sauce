import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { QuestionType } from '../../types/question.types';
import { Button } from '../Shared/Button';

export const QuestionTypeManager: React.FC = () => {
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [editingType, setEditingType] = useState<QuestionType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    requiresOptions: false,
    requiresTextAnswer: false,
    supportsImage: false,
    supportsAudio: false,
    defaultTimeLimit: 30,
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await api.get('/question-types');
      setQuestionTypes(response.data);
    } catch (error) {
      console.error('Error fetching question types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingType) {
        await api.put(`/question-types/${editingType.id}`, formData);
      } else {
        await api.post('/question-types', formData);
      }
      await fetchTypes();
      resetForm();
    } catch (error) {
      console.error('Error saving question type:', error);
    }
  };

  const handleEdit = (type: QuestionType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      nameAr: type.nameAr,
      description: type.description,
      requiresOptions: type.requiresOptions,
      requiresTextAnswer: type.requiresTextAnswer,
      supportsImage: type.supportsImage,
      supportsAudio: type.supportsAudio,
      defaultTimeLimit: type.defaultTimeLimit,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا النوع؟')) {
      try {
        await api.delete(`/question-types/${id}`);
        await fetchTypes();
      } catch (error) {
        console.error('Error deleting question type:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      requiresOptions: false,
      requiresTextAnswer: false,
      supportsImage: false,
      supportsAudio: false,
      defaultTimeLimit: 30,
    });
    setEditingType(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">إدارة أنواع الأسئلة</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'إلغاء' : 'إضافة نوع جديد'}
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
            <div className="md:col-span-2">
              <label className="block text-white mb-2">الوصف</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
                dir="rtl"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2">الوقت الافتراضي (ثانية)</label>
              <input
                type="number"
                value={formData.defaultTimeLimit}
                onChange={(e) =>
                  setFormData({ ...formData, defaultTimeLimit: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
                min="5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={formData.requiresOptions}
                onChange={(e) =>
                  setFormData({ ...formData, requiresOptions: e.target.checked })
                }
                className="ml-2"
              />
              يتطلب خيارات
            </label>
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={formData.requiresTextAnswer}
                onChange={(e) =>
                  setFormData({ ...formData, requiresTextAnswer: e.target.checked })
                }
                className="ml-2"
              />
              يتطلب إجابة نصية
            </label>
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={formData.supportsImage}
                onChange={(e) =>
                  setFormData({ ...formData, supportsImage: e.target.checked })
                }
                className="ml-2"
              />
              يدعم الصور
            </label>
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={formData.supportsAudio}
                onChange={(e) =>
                  setFormData({ ...formData, supportsAudio: e.target.checked })
                }
                className="ml-2"
              />
              يدعم الصوت
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="success">
              {editingType ? 'تحديث' : 'إضافة'}
            </Button>
            <Button type="button" onClick={resetForm} variant="secondary">
              إلغاء
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questionTypes.map((type) => (
          <div key={type.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-xl font-bold text-white mb-2">{type.nameAr}</h3>
            <p className="text-white/80 mb-4">{type.description}</p>
            <div className="text-white/60 text-sm mb-4">
              <div>الوقت الافتراضي: {type.defaultTimeLimit} ثانية</div>
              <div>
                {type.requiresOptions && '• خيارات '}
                {type.requiresTextAnswer && '• إجابة نصية '}
                {type.supportsImage && '• صور '}
                {type.supportsAudio && '• صوت'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleEdit(type)} size="sm" variant="secondary">
                تعديل
              </Button>
              <Button onClick={() => handleDelete(type.id)} size="sm" variant="danger">
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

