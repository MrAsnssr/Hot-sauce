# Question Convert API - Usage Examples

This document shows how to use the new `/api/questions/convert` endpoint to convert question structures into database questions.

## Endpoints

### Single or Multiple Questions Conversion
**POST** `/api/questions/convert`

This endpoint accepts:
- **Single question**: Send a question object directly
- **Multiple questions (array)**: Send an array of questions `[{...}, {...}]`
- **Multiple questions (object)**: Send `{ questions: [{...}, {...}] }`

### Batch Question Conversion (Alternative)
**POST** `/api/questions/convert/batch`

Same as sending `{ questions: [...] }` to `/convert`

---

## Question Type Examples

### 1. Fill the Blank (`fill-blank`)

```json
POST /api/questions/convert
{
  "text": "وقعت معركة هاستينغز في ________.",
  "questionTypeId": "fill-blank",
  "subjectId": "YOUR_SUBJECT_ID",
  "correctAnswer": "1066",
  "difficulty": "easy",
  "points": 10,
  "timeLimit": 40
}
```

### 2. One of 4 Choose (`four-options`)

```json
POST /api/questions/convert
{
  "text": "من هو قائد الثورة الفرنسية التي بدأت عام 1789؟",
  "questionTypeId": "four-options",
  "subjectId": "YOUR_SUBJECT_ID",
  "options": [
    { "id": "1", "text": "نابليون بونابرت", "isCorrect": false },
    { "id": "2", "text": "لويس السادس عشر", "isCorrect": false },
    { "id": "3", "text": "ماكسيميليان روبسبير", "isCorrect": true },
    { "id": "4", "text": "جان بول مارات", "isCorrect": false }
  ],
  "difficulty": "medium",
  "points": 15,
  "timeLimit": 30
}
```

### 3. Chronological Order (`order-challenge`)

```json
POST /api/questions/convert
{
  "text": "رتب الأحداث التالية زمنياً:",
  "questionTypeId": "order-challenge",
  "subjectId": "YOUR_SUBJECT_ID",
  "orderItems": [
    { "id": "1", "text": "سقوط القسطنطينية", "correctPosition": 1 },
    { "id": "2", "text": "اكتشاف أمريكا", "correctPosition": 2 },
    { "id": "3", "text": "معاهدة وستفاليا", "correctPosition": 3 },
    { "id": "4", "text": "الثورة الفرنسية", "correctPosition": 4 }
  ],
  "difficulty": "hard",
  "points": 20,
  "timeLimit": 45
}
```

### 4. Link People to Achievement (`who-and-who`)

```json
POST /api/questions/convert
{
  "text": "وصّل كل شخص بإنجازه:",
  "questionTypeId": "who-and-who",
  "subjectId": "YOUR_SUBJECT_ID",
  "whoAndWhoData": {
    "people": [
      { "id": "p1", "name": "توماس إديسون" },
      { "id": "p2", "name": "نيكولا تيسلا" }
    ],
    "achievements": [
      { "id": "a1", "text": "اخترع المصباح الكهربائي", "personId": "p1" },
      { "id": "a2", "text": "طور التيار المتردد", "personId": "p2" }
    ]
  },
  "difficulty": "medium",
  "points": 15,
  "timeLimit": 50
}
```

---

## Multiple Questions Examples

### Option 1: Send Array Directly (Recommended)

```json
POST /api/questions/convert
[
  {
    "text": "وقعت معركة هاستينغز في ________.",
    "questionTypeId": "fill-blank",
    "subjectId": "YOUR_SUBJECT_ID",
    "correctAnswer": "1066",
    "difficulty": "easy"
  },
  {
    "text": "من هو قائد الثورة الفرنسية؟",
    "questionTypeId": "four-options",
    "subjectId": "YOUR_SUBJECT_ID",
    "options": [
      { "id": "1", "text": "نابليون", "isCorrect": false },
      { "id": "2", "text": "روبسبير", "isCorrect": true },
      { "id": "3", "text": "لويس السادس عشر", "isCorrect": false },
      { "id": "4", "text": "مارات", "isCorrect": false }
    ],
    "difficulty": "medium"
  }
]
```

### Option 2: Send Object with Questions Property

```json
POST /api/questions/convert
{
  "questions": [
    {
      "text": "وقعت معركة هاستينغز في ________.",
      "questionTypeId": "fill-blank",
      "subjectId": "YOUR_SUBJECT_ID",
      "correctAnswer": "1066",
      "difficulty": "easy"
    },
    {
      "text": "من هو قائد الثورة الفرنسية؟",
      "questionTypeId": "four-options",
      "subjectId": "YOUR_SUBJECT_ID",
      "options": [
        { "id": "1", "text": "نابليون", "isCorrect": false },
        { "id": "2", "text": "روبسبير", "isCorrect": true },
        { "id": "3", "text": "لويس السادس عشر", "isCorrect": false },
        { "id": "4", "text": "مارات", "isCorrect": false }
      ],
      "difficulty": "medium"
    }
  ]
}
```

### Option 3: Use Batch Endpoint

```json
POST /api/questions/convert/batch
{
  "questions": [
    {
      "text": "وقعت معركة هاستينغز في ________.",
      "questionTypeId": "fill-blank",
      "subjectId": "YOUR_SUBJECT_ID",
      "correctAnswer": "1066",
      "difficulty": "easy"
    },
    {
      "text": "من هو قائد الثورة الفرنسية؟",
      "questionTypeId": "four-options",
      "subjectId": "YOUR_SUBJECT_ID",
      "options": [
        { "id": "1", "text": "نابليون", "isCorrect": false },
        { "id": "2", "text": "روبسبير", "isCorrect": true },
        { "id": "3", "text": "لويس السادس عشر", "isCorrect": false },
        { "id": "4", "text": "مارات", "isCorrect": false }
      ],
      "difficulty": "medium"
    }
  ]
}
```

**Response (for all batch options):**
```json
{
  "message": "Processed 2 questions",
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": {
    "success": [
      { "index": 0, "question": {...} },
      { "index": 1, "question": {...} }
    ],
    "errors": []
  }
}
```

---

## Required Fields

All question types require:
- `text` (string) - The question text
- `questionTypeId` (string) - One of: `fill-blank`, `four-options`, `order-challenge`, `who-and-who`
- `subjectId` (string/ObjectId) - ID of the subject

Optional fields (with defaults):
- `difficulty` (string) - `easy`, `medium`, or `hard` (default: `medium`)
- `points` (number) - Default based on difficulty: easy=10, medium=15, hard=20
- `timeLimit` (number) - Default based on difficulty: easy=30, medium=40, hard=50

---

## Type-Specific Requirements

### Fill Blank
- `correctAnswer` (string) - Required

### Four Options
- `options` (array) - Required, must have exactly 4 items
- Exactly one option must have `isCorrect: true`

### Order Challenge
- `orderItems` (array) - Required, must have 4 or 5 items
- Each item must have: `id`, `text`, `correctPosition` (number)

### Who and Who
- `whoAndWhoData` (object) - Required
  - `people` (array) - Exactly 2 people, each with `id` and `name`
  - `achievements` (array) - Exactly 2 achievements, each with `id`, `text`, and `personId` (matching a person's id)

---

## Error Responses

All endpoints return appropriate HTTP status codes:
- `201` - Success
- `400` - Bad Request (validation errors)
- `404` - Subject not found
- `500` - Server error

