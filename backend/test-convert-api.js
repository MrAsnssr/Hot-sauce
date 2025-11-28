// Quick test script for the convert API endpoint
// Run with: node test-convert-api.js

const testQuestions = [
  {
    text: "وقعت معركة هاستينغز في ________.",
    questionTypeId: "fill-blank",
    subjectId: "YOUR_SUBJECT_ID_HERE", // Replace with actual subject ID
    correctAnswer: "1066",
    difficulty: "easy",
    points: 10,
    timeLimit: 40
  },
  {
    text: "من هو قائد الثورة الفرنسية التي بدأت عام 1789؟",
    questionTypeId: "four-options",
    subjectId: "YOUR_SUBJECT_ID_HERE", // Replace with actual subject ID
    options: [
      { id: "1", text: "نابليون بونابرت", isCorrect: false },
      { id: "2", text: "لويس السادس عشر", isCorrect: false },
      { id: "3", text: "ماكسيميليان روبسبير", isCorrect: true },
      { id: "4", text: "جان بول مارات", isCorrect: false }
    ],
    difficulty: "medium",
    points: 15,
    timeLimit: 30
  }
];

async function testConvertAPI() {
  const API_URL = 'http://localhost:5000/api/questions/convert';
  
  console.log('🧪 Testing Question Convert API...\n');
  console.log('📡 Endpoint:', API_URL);
  console.log('📦 Sending', testQuestions.length, 'questions\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testQuestions)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success!\n');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Your server is running (npm start in backend folder)');
    console.log('   2. The API_URL is correct');
    console.log('   3. You replaced YOUR_SUBJECT_ID_HERE with a real subject ID');
  }
}

// Run the test
testConvertAPI();

