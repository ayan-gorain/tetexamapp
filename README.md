# TET Master - Primary TET Preparation & AI Quiz
> **পশ্চিমবঙ্গ প্রাথমিক টেট প্রস্তুতি ও এআই কুইজ প্ল্যাটফর্ম (WB Primary TET Exam Prep)**

A mobile-first, responsive web application built with **Angular 19+ (Standalone Components)** to empower candidates preparing for the Primary Teacher Eligibility Test (Primary TET). Powered by **Google Gemini Flash API** for real-time AI quiz generation and pedagogical explanations in **Bengali (বাংলা)**, alongside a verified repository of **Previous Year Questions (PYQs)**.

---

## 🌟 Key Features

### 1. 📊 Interactive Dashboard
- **Comprehensive Stats**: Total quizzes attempted, questions answered, correct answers, overall accuracy percentage, and daily streak counter (🔥).
- **Subject-wise Performance Breakdown**: Visual progress bars across all 5 Primary TET subjects:
  - 📖 **বাংলা ভাষা ও সাহিত্য (Bengali)**
  - 🔢 **গণিত ও শিক্ষণপদ্ধতি (Mathematics)**
  - 🧠 **শিশু বিকাশ ও মনস্তত্ত্ব (Child Development & Pedagogy - CDP)**
  - 🌿 **পরিবেশবিদ্যা (Environmental Studies - EVS)**
  - 🔤 **ইংরেজি ভাষা (English)**
- **🎯 Targeted Weak Subject Practice**: Automatically analyzes previous test performances, detects the candidate's weakest subject, and offers 1-click targeted practice.
- **Recent Test History**: Quick review and score trends for past attempts.

### 2. ⚡ AI-Powered Quiz Creation
- **Flexible Quiz Types**:
  - **Subject-wise Quiz**: Focus on any single TET subject.
  - **Mixed Quiz**: Balanced question distribution across all 5 syllabus subjects.
- **Customizable Parameters**:
  - Number of questions: `5`, `10`, `20`, `30`, `50`.
  - Difficulty: `Easy` (সহজ), `Medium` (মাঝারি), `Hard` (কঠিন), `Mixed` (মিশ্র).
  - Mode: `Practice Mode` (relaxed untimed practice) or `Mock Test Mode` (timed exam with countdown timer and auto-submission).
- **Multi-stage Animated Loader**: Live status indicator displaying *"Creating questions"*, *"Checking answers"*, and *"Preparing your quiz"*.

### 3. 📝 Mobile-First Live Quiz Interface
- Clean, distraction-free examination screen with large touch targets.
- Real-time countdown timer with pulse alert when under 2 minutes (Mock Test Mode).
- Standard 4-option cards with Bengali lettering (`ক`, `খ`, `গ`, `ঘ`) preventing accidental multi-selection.
- **Question Navigator Palette**: Easily jump to any question, view answered (`Green`), flagged for review (`Yellow`), or unattempted (`Gray`) questions.
- Submission confirmation dialog showing answered vs unanswered questions breakdown.

### 4. 🏆 Comprehensive Results & Scoring
- Instant score card (`Score / Total`), Accuracy %, Correct, Incorrect, and Skipped counters.
- Celebratory confetti animation on passing scores.
- Test-specific subject breakdown for mixed mock tests.
- Direct navigation to **Review Answers**, **Try Again**, or **Create New Quiz**.

### 5. 💡 In-Depth Review & AI Tutor
- Question-by-question review with color-coded answer comparison.
- **💡 Explain This (AI ব্যাখ্যা)**: On-demand call to Gemini to break down pedagogical concepts, child development theories (Piaget, Vygotsky, Kohlberg), or math calculations in simple Bengali.
- **🔄 Generate Similar Question (অনুরূপ প্রশ্ন তৈরি)**: Generates a brand new question on the fly testing the exact same concept to reinforce understanding.

### 6. 📚 Verified Previous Year Questions (PYQ)
- Authentic West Bengal Primary TET questions from **2014, 2017, 2021, 2022, and 2023**.
- Filterable by **Year**, **Subject**, **Topic**, **Difficulty**, and **Keyword Search**.
- Interactive reveal mode for answers and pedagogical explanations.
- **1-Click PYQ Mock Test**: Convert filtered authentic past exam questions into a live mock test.

### 7. 🛡️ Gemini Settings & Offline Reliability
- Direct in-app API Key modal to enter or update your Google Gemini API Key.
- Configurable models (`gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`).
- **Zero-Crash Offline Fallback**: Includes a rich built-in dataset of 50+ Primary TET questions in Bengali, ensuring the app works seamlessly even if offline or if no API key is provided.

---

## 🏗️ Architecture & Technology Stack

```
Frontend Only Architecture (Angular 19+ Standalone):
src/
 ├── app/
 │    ├── core/
 │    │    └── data/
 │    │         ├── fallback-questions.data.ts (Offline Fallback Bank)
 │    │         └── pyq-questions.data.ts (Authentic 2014-2023 TET Questions)
 │    │
 │    ├── shared/
 │    │    ├── models/
 │    │    │    └── quiz.model.ts (TypeScript interfaces & types)
 │    │    └── components/
 │    │         ├── navbar/ (Responsive desktop & mobile bottom nav)
 │    │         └── api-key-modal/ (Gemini key & model config)
 │    │
 │    ├── features/
 │    │    ├── dashboard/ (Analytics, streaks & weak subject practice)
 │    │    ├── create-quiz/ (Custom quiz form & animated loaders)
 │    │    ├── quiz-screen/ (Mobile-first test screen with timer)
 │    │    ├── result/ (Score cards, subject metrics & confetti)
 │    │    ├── review/ (Answer review with AI explanations & similar Qs)
 │    │    └── previous-year/ (Authentic TET question repository)
 │    │
 │    ├── services/
 │    │    ├── gemini.service.ts (Direct Gemini Flash API client & JSON validator)
 │    │    ├── quiz.service.ts (Test state, scoring & timer management)
 │    │    ├── storage.service.ts (Dual-layer persistence & streak calculator)
 │    │    └── pyq.service.ts (Curated TET past papers & filter engine)
 │    │
 │    ├── app.routes.ts
 │    └── app.config.ts
 └── environments/
      ├── environment.ts
      └── environment.development.ts
```

---

## 🔒 Security Notice

As designed for this frontend-only version, the Gemini API is called directly from the Angular client. In a public production deployment, API requests should be proxied through a secure backend (e.g. Firebase Cloud Functions, Node.js, or Spring Boot) to prevent client-side exposure of API keys.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+)

### 2. Installation
```bash
npm install
```

### 3. Run Locally
```bash
npm start
```
Open your browser at `http://localhost:4200/` (or the configured port).

### 4. Build for Production
```bash
npm run build
```
Production build artifacts will be generated in `dist/tetexamprep/browser/`.

---

## 🌐 Bengali Font Support (বাংলা ফন্ট)

TET Master integrates Google Fonts (`Hind Siliguri` and `Noto Sans Bengali`) with full UTF-8 encoding support to ensure Bengali conjuncts (যুক্তাক্ষর) and numerals render cleanly across all mobile devices, tablets, and desktop browsers.
