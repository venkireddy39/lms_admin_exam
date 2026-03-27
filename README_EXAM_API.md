# Exam System API Flow (18 Steps)

This document outlines the complete lifecycle for creating, mapping, attempting, and evaluating an exam in the LMS system.

## PART 1: EXAM SETUP

### Step 1: Create the Exam
- **Endpoint**: `POST /api/exams`
- **Description**: Creates the base exam record. Note down the returned `examId`.
- **Payload**:
  ```json
  {
    "examType": "MOCK",
    "title": "Full Stack Final Assessment",
    "totalMarks": 100,
    "passPercentage": 40.0,
    "durationMinutes": 60,
    "certificateEnabled": true
  }
  ```

### Step 2: Configure Exam Settings
- **Endpoint**: `POST /api/exams/{examId}/settings`
- **Description**: Adjusts user interaction rules during the exam.
- **Payload**:
  ```json
  {
    "allowResume": true,
    "allowNavigation": true,
    "shuffleQuestions": true,
    "calculatorEnabled": false,
    "strictTimeline": true,
    "canSubmitBeforeEnd": true
  }
  ```

### Step 3: Configure Grading Rules
- **Endpoint**: `POST /api/exams/{examId}/grading`
- **Description**: Sets rules for how and when the results are displayed.
- **Payload**:
  ```json
  {
    "autoEvaluation": true,
    "partialMarking": true,
    "showResult": true,
    "showRank": false,
    "showPercentile": false
  }
  ```

### Step 4: Configure Proctoring Rules
- **Endpoint**: `POST /api/exams/{examId}/proctoring`
- **Description**: Defines anti-cheat mechanisms.
- **Payload**:
  ```json
  {
    "videoProctoring": true,
    "audioProctoring": false,
    "screenProctoring": true,
    "browserTolerance": 3,
    "captureIntervalMins": 5
  }
  ```

### Step 5: Configure Exam Design (Multipart)
- **Endpoint**: `POST /api/exams/{examId}/design/upload`
- **Type**: `multipart/form-data`
- **Description**: Sets up the visual presentation.
- **Fields**:
  - `orientation`: `PORTRAIT`
  - `watermarkType`: `TEXT`
  - `watermarkValue`: `CONFIDENTIAL`
  - `watermarkOpacity`: `30`
  - `instituteLogo`: *(File Upload)*

### Step 6: Create Exam Schedule
- **Endpoint**: `POST /api/exam-schedules`
- **Description**: Defines the exam window.
- **Payload**:
  ```json
  {
    "examId": <your_examId>,
    "scheduleType": "FLEXIBLE",
    "startDate": "2026-03-20T10:00:00",
    "endDate": "2026-03-25T18:00:00",
    "durationSeconds": 3600,
    "isActive": true
  }
  ```

---

## PART 2: QUESTION BANK & MAPPING

### Step 7: Create Questions
Each question type has its own payload structure. Note down the returned `questionId`.

- **MCQ**: `POST /api/questions`
  ```json
  { "questionText": "...", "questionType": "MCQ", "contentType": "TEXT" }
  ```
- **Descriptive**: `POST /api/questions`
  ```json
  { 
    "questionText": "...", "questionType": "DESCRIPTIVE", 
    "modelAnswer": "...", "keywords": "..." 
  }
  ```
- **Coding**: `POST /api/questions`
  ```json
  { "questionText": "...", "questionType": "CODING", "programmingLanguage": "JAVA" }
  ```

### Step 8: Add Options for MCQ
- **Endpoint**: `POST /api/questions/{mcqId}/options`
- **Payload**:
  ```json
  [
    { "optionText": "Cascading Style Sheets", "isCorrect": true },
    { "optionText": "Computer Style Sheets", "isCorrect": false }
  ]
  ```

### Step 9: Add Test Cases for Coding
- **Endpoint**: `POST /api/questions/{codingId}/coding-test-cases`
- **Payload**:
  ```json
  [
    { "inputData": "hello", "expectedOutput": "olleh", "hidden": false }
  ]
  ```

### Step 10: Manage Question Sections
- **Endpoint**: `POST /api/sections`
- **Description**: Creates a reusable section (e.g., "Technical Aptitude").
- **Payload**:
  ```json
  {
    "sectionName": "Technical Aptitude",
    "sectionDescription": "General technical knowledge test",
    "shuffleQuestions": true
  }
  ```

### Step 11: Map Sections and Questions
- **Phase A**: `POST /api/exams/{examId}/sections?sectionId={sectionId}&sectionOrder=1`
- **Phase B**: `POST /api/exam-sections/{examSectionId}/questions`
  ```json
  [
    { "questionId": <id>, "marks": 10.0, "questionOrder": 1 }
  ]
  ```

### Step 12: Publish Exam
- **Endpoint**: `PUT /api/exams/{examId}/publish`

---

## PART 3: STUDENT ATTEMPT & EVALUATION

### Step 13: Start Student Attempt
- **Endpoint**: `POST /api/exams/{examId}/attempts/start`

### Step 14: Save Responses
- **Endpoint**: `POST /api/exam-attempts/{attemptId}/responses`
- **Payload Examples**:
  - **MCQ**: `{ "examQuestionId": <id>, "selectedOptionId": <id> }`
  - **Descriptive**: `{ "examQuestionId": <id>, "descriptiveAnswer": "..." }`
  - **Coding**: `{ "examQuestionId": <id>, "codingSubmissionCode": "..." }`

### Step 15: Submit the Exam
- **Endpoint**: `POST /api/exams/{examId}/attempts/{attemptId}/submit`

### Step 16: Fetch Responses for Evaluation
- **Descriptive**: `GET /api/exam-attempts/{attemptId}/descriptive-responses`
- **Coding**: `GET /api/exam-attempts/{attemptId}/responses/coding-responses`

### Step 17: Manual Evaluation
- **Descriptive**: `POST /api/exam-attempts/{attemptId}/responses/{responseId}/evaluate?marks=35`
- **Coding**: `POST /api/exam-attempts/{attemptId}/evaluation-logs/coding-evaluate/{responseId}`
  ```json
  { "marks": 50.0, "reason": "Passed all test cases" }
  ```

### Step 18: View Final Result
- **Endpoint**: `GET /api/exams/{examId}/attempts/{attemptId}/result`
