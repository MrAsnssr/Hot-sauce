import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Button } from '../Shared/Button';

interface Subject {
  _id: string;
  name: string;
  nameAr: string;
}

interface ConversionResult {
  message: string;
  total?: number;
  successful?: number;
  failed?: number;
  results?: {
    success: Array<{ index: number; question: any }>;
    errors: Array<{ index: number; error: string; data?: any }>;
  };
  question?: any;
}

export const QuestionConverter: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
      if (response.data.length > 0) {
        setSelectedSubjectId(response.data[0]._id);
      }
    } catch (err: any) {
      console.error('Failed to fetch subjects:', err);
      setError('فشل تحميل المواضيع');
    }
  };

  const handleConvert = async () => {
    if (!jsonInput.trim()) {
      setError('الرجاء إدخال بيانات الأسئلة');
      return;
    }

    if (!selectedSubjectId) {
      setError('الرجاء اختيار موضوع');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Parse JSON input
      let questionsData: any;
      try {
        questionsData = JSON.parse(jsonInput);
      } catch (parseError) {
        setError('خطأ في تنسيق JSON. الرجاء التحقق من صحة البيانات');
        setLoading(false);
        return;
      }

      // Ensure it's an array
      const questionsArray = Array.isArray(questionsData) ? questionsData : [questionsData];

      // Add subjectId to all questions if not present
      const questionsWithSubject = questionsArray.map((q: any) => ({
        ...q,
        subjectId: q.subjectId || selectedSubjectId,
      }));

      // Show progress for large batches
      if (questionsWithSubject.length > 10) {
        console.log(`Processing ${questionsWithSubject.length} questions...`);
      }

      // Send to API with longer timeout for large batches
      const response = await api.post('/questions/convert', questionsWithSubject, {
        timeout: questionsWithSubject.length > 50 ? 120000 : 60000, // 2 min for large batches, 1 min otherwise
      });
      setResult(response.data);
    } catch (err: any) {
      console.error('Conversion error:', err);
      
      // Handle timeout specifically
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('انتهت مهلة الاتصال. قد تكون البيانات كبيرة جداً. حاول تقسيم الأسئلة إلى مجموعات أصغر.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تحويل الأسئلة. تأكد من أن الخادم يعمل وأن البيانات صحيحة.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setResult(null);
    setError('');
  };

  const loadExample = (type: 'fill-blank' | 'four-options' | 'order-challenge' | 'who-and-who') => {
    const examples = {
      'fill-blank': {
        text: "وقعت معركة هاستينغز في ________.",
        questionTypeId: "fill-blank",
        correctAnswer: "1066",
        difficulty: "easy",
        points: 10,
        timeLimit: 40
      },
      'four-options': {
        text: "من هو قائد الثورة الفرنسية التي بدأت عام 1789؟",
        questionTypeId: "four-options",
        options: [
          { id: "1", text: "نابليون بونابرت", isCorrect: false },
          { id: "2", text: "لويس السادس عشر", isCorrect: false },
          { id: "3", text: "ماكسيميليان روبسبير", isCorrect: true },
          { id: "4", text: "جان بول مارات", isCorrect: false }
        ],
        difficulty: "medium",
        points: 15,
        timeLimit: 30
      },
      'order-challenge': {
        text: "رتب الأحداث التالية زمنياً:",
        questionTypeId: "order-challenge",
        orderItems: [
          { id: "1", text: "سقوط القسطنطينية", correctPosition: 1 },
          { id: "2", text: "اكتشاف أمريكا", correctPosition: 2 },
          { id: "3", text: "معاهدة وستفاليا", correctPosition: 3 },
          { id: "4", text: "الثورة الفرنسية", correctPosition: 4 }
        ],
        difficulty: "hard",
        points: 20,
        timeLimit: 45
      },
      'who-and-who': {
        text: "وصّل كل شخص بإنجازه:",
        questionTypeId: "who-and-who",
        whoAndWhoData: {
          people: [
            { id: "p1", name: "توماس إديسون" },
            { id: "p2", name: "نيكولا تيسلا" }
          ],
          achievements: [
            { id: "a1", text: "اخترع المصباح الكهربائي", personId: "p1" },
            { id: "a2", text: "طور التيار المتردد", personId: "p2" }
          ]
        },
        difficulty: "medium",
        points: 15,
        timeLimit: 50
      }
    };

    setJsonInput(JSON.stringify([examples[type]], null, 2));
  };

  return (
    <div className="bg-white/90 rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        محول الأسئلة (تحويل مباشر)
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        أدخل بيانات الأسئلة بصيغة JSON (سؤال واحد أو عدة أسئلة)
        <br />
        <span className="text-sm text-gray-500">
          ⚡ تحويل مباشر بدون استخدام الذكاء الاصطناعي - يتم التحقق من البيانات وحفظها مباشرة
        </span>
      </p>

      {/* Subject Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اختر الموضوع:
        </label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.nameAr} ({subject.name})
            </option>
          ))}
        </select>
      </div>

      {/* Example Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 self-center">أمثلة:</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadExample('fill-blank')}
          disabled={loading}
        >
          ملء الفراغ
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadExample('four-options')}
          disabled={loading}
        >
          اختيار من 4
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadExample('order-challenge')}
          disabled={loading}
        >
          الترتيب الزمني
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadExample('who-and-who')}
          disabled={loading}
        >
          من ومن
        </Button>
      </div>

      {/* JSON Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          بيانات JSON:
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='[{"text": "...", "questionTypeId": "fill-blank", "correctAnswer": "...", ...}]'
          className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          disabled={loading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-4">
        <Button
          variant="primary"
          onClick={handleConvert}
          disabled={loading || !jsonInput.trim() || !selectedSubjectId}
          className="flex-1"
        >
          {loading ? 'جاري التحويل...' : 'تحويل وإضافة الأسئلة'}
        </Button>
        <Button
          variant="secondary"
          onClick={handleClear}
          disabled={loading}
        >
          مسح
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>خطأ:</strong> {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-4">
          {result.total !== undefined ? (
            // Batch result
            <div className="p-4 bg-green-50 border border-green-400 rounded-lg">
              <h3 className="text-lg font-bold text-green-800 mb-2">
                ✅ تمت المعالجة
              </h3>
              <p className="text-green-700 mb-2">
                <strong>المجموع:</strong> {result.total} سؤال
              </p>
              <p className="text-green-700 mb-2">
                <strong>نجح:</strong> {result.successful} | <strong>فشل:</strong> {result.failed}
              </p>
              
              {result.results?.errors && result.results.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-red-700 mb-2">الأخطاء:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.results.errors.map((err, idx) => (
                      <li key={idx} className="text-red-600 text-sm">
                        السؤال #{err.index + 1}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.results?.success && result.results.success.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-green-700 mb-2">
                    تم إضافة {result.results.success.length} سؤال بنجاح
                  </h4>
                </div>
              )}
            </div>
          ) : (
            // Single result
            <div className="p-4 bg-green-50 border border-green-400 rounded-lg">
              <h3 className="text-lg font-bold text-green-800 mb-2">
                ✅ تم إنشاء السؤال بنجاح
              </h3>
              <p className="text-green-700">
                تم إضافة السؤال إلى قاعدة البيانات
              </p>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-bold text-blue-800 mb-2">💡 نصائح:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
          <li>يمكنك إدخال سؤال واحد (كائن JSON) أو عدة أسئلة (مصفوفة)</li>
          <li>إذا لم تحدد subjectId في البيانات، سيتم استخدام الموضوع المحدد أعلاه</li>
          <li>استخدم الأزرار أعلاه لتحميل أمثلة لكل نوع سؤال</li>
          <li>يمكنك نسخ ولصق البيانات مباشرة من ملفات JSON</li>
          <li className="font-semibold text-green-700">⚡ هذا المحول يعمل مباشرة بدون ذكاء اصطناعي - تحويل فوري للبيانات</li>
        </ul>
      </div>
    </div>
  );
};

