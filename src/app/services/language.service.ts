import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AppLanguage = 'bn' | 'en';

export interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

export const TRANSLATION_DICTIONARY: Translations = {
  // Brand & Navigation
  'app.title': { bn: 'টেট মাস্টার', en: 'TET Master' },
  'app.subtitle': { bn: 'প্রাথমিক টেট প্রস্তুতি ও মক টেস্ট', en: 'Primary TET Preparation & AI Quiz' },
  'nav.dashboard': { bn: 'হোম পেজ', en: 'Home' },
  'nav.savedNotes': { bn: 'স্টাডি নোটস', en: 'Study Vault' },
  'nav.createQuiz': { bn: 'নতুন কুইজ', en: 'Create Quiz' },
  'nav.pyq': { bn: 'বিগত বছরের প্রশ্ন', en: 'Previous Year Papers' },
  'nav.settings': { bn: 'সেটিংস', en: 'Settings' },
  'nav.streak': { bn: 'দিনের ধারাবাহিকতা', en: 'Day Streak' },

  // Auth
  'auth.loginWithGoogle': { bn: 'Google দিয়ে লগইন করুন', en: 'Continue with Google' },
  'auth.login': { bn: 'লগইন', en: 'Login' },
  'auth.logout': { bn: 'লগআউট', en: 'Logout' },
  'auth.loggingIn': { bn: 'লগইন হচ্ছে...', en: 'Signing in...' },
  'auth.welcome': { bn: 'স্বাগতম', en: 'Welcome' },
  'auth.dialogTitle': { bn: 'স্বাগতম! চালিয়ে যেতে লগইন করুন', en: 'Welcome! Sign in to Continue' },
  'auth.dialogSubtitle': { bn: 'আপনার প্রাথমিক টেট প্রস্তুতি, AI মক টেস্ট ও ফলাফল সংরক্ষণ করতে Google অ্যাকাউন্ট দিয়ে লগইন করুন।', en: 'Sign in with your Google account to access all practice tests, mock exams, and save your personal progress.' },
  'auth.selectLang': { bn: 'ভাষা নির্বাচন', en: 'Language' },
  'auth.loadingApp': { bn: 'টেট মাস্টার প্রস্তুত করা হচ্ছে...', en: 'Loading TET Master...' },
  'auth.feature1': { bn: '🎯 ৫টি বিষয়ের সিলেবাস ভিত্তিক প্রশ্ন ও বিগত বছরের আসল পেপার', en: '🎯 Complete 5-subject syllabus & authentic past papers' },
  'auth.feature2': { bn: '📊 ব্যক্তিগত স্কোর, নির্ভুলতা ও দুর্বল বিষয় বিশ্লেষণ', en: '📊 Personalized scores, accuracy rate & weak topic tracking' },
  'auth.feature3': { bn: '⚡ টাইমার সহ আসল পরীক্ষার মক টেস্ট ও সহজ ব্যাখ্যা', en: '⚡ Real-time timed mock tests with step-by-step explanations' },
  'auth.secureLogin': { bn: '🔒 নিরাপদ Google সাইন-ইন', en: '🔒 Secure Google Authentication' },

  // Dashboard
  'dashboard.heroBadge': { bn: 'পশ্চিমবঙ্গ প্রাথমিক টেট (WB Primary TET)', en: 'West Bengal Primary TET' },
  'dashboard.heroTitle': { bn: 'নমস্কার! টেট প্রস্তুতিতে আপনাকে স্বাগতম', en: 'Welcome to TET Preparation!' },
  'dashboard.heroDesc': { bn: 'সহজ ভাষায় প্রতিদিন কুইজ ও মক টেস্ট দিয়ে নিজের প্রস্তুতিকে আরও আত্মবিশ্বাসী ও মজবুত করুন।', en: 'Practice daily quizzes and mock tests to strengthen your exam preparation.' },
  'dashboard.startQuiz': { bn: 'মক টেস্ট শুরু করুন', en: 'Start Quick Quiz' },
  'dashboard.customQuiz': { bn: 'কাস্টম কুইজ বানান', en: 'Create Custom Quiz' },
  'dashboard.totalQuizzes': { bn: 'মোট দেওয়া পরীক্ষা', en: 'Total Quizzes' },
  'dashboard.questionsAnswered': { bn: 'সমাধান করা প্রশ্ন', en: 'Questions Solved' },
  'dashboard.accuracy': { bn: 'সঠিকতার হার', en: 'Overall Accuracy' },
  'dashboard.streak': { bn: 'ধারাবাহিকতা', en: 'Daily Streak' },
  'dashboard.weakSubjectTitle': { bn: 'অনুশীলনের জন্য নির্বাচিত বিষয়', en: 'Practice Weak Subject' },
  'dashboard.weakSubjectDesc': { bn: 'আপনার ফলাফলের ভিত্তিতে এই বিষয়ে একটু বেশি অনুশীলনের পরামর্শ দেওয়া হচ্ছে:', en: 'Based on your performance, you need more practice in:' },
  'dashboard.practiceWeakBtn': { bn: 'অনুশীলন করুন', en: 'Practice Now' },
  'dashboard.subjectPerfTitle': { bn: 'বিষয়ভিত্তিক প্রস্তুতি ও ফলাফল', en: 'Subject-wise Performance' },
  'dashboard.subjectCount': { bn: '৫টি মূল বিষয়', en: '5 Core Subjects' },
  'dashboard.noDataMsg': { bn: 'আপনি এখনও কোনো পরীক্ষা দেননি। একটি কুইজ সম্পূর্ণ করলেই ফলাফল দেখতে পাবেন।', en: 'You have not attempted any quiz yet. Complete a quiz to view your subject-wise breakdown.' },
  'dashboard.pyqTitle': { bn: 'বিগত বছরের প্রশ্নপত্র (PYQ)', en: 'Previous Year Papers (PYQ)' },
  'dashboard.pyqDesc': { bn: '২০১৪ থেকে ২০২৩ সাল পর্যন্ত পশ্চিমবঙ্গ প্রাথমিক টেটের আসল প্রশ্নপত্র সমাধান ও সহজ ব্যাখ্যাসহ অনুশীলন করুন।', en: 'Practice verified WB Primary TET question papers from 2014 to 2023 with step-by-step explanations.' },
  'dashboard.explorePyq': { bn: 'বিগত বছরের প্রশ্ন দেখুন', en: 'Explore Previous Papers' },
  'dashboard.recentResults': { bn: 'সাম্প্রতিক পরীক্ষার ফলাফল', en: 'Recent Quiz Results' },
  'dashboard.clearHistory': { bn: 'হিস্ট্রি মুছুন', en: 'Clear History' },
  'dashboard.noRecentTests': { bn: 'এখনও কোনো পরীক্ষা সম্পন্ন হয়নি', en: 'No completed tests yet' },
  'dashboard.mockTestBadge': { bn: 'মক টেস্ট (সময় সহ)', en: 'Timed Mock Test' },
  'dashboard.practiceBadge': { bn: 'অনুশীলন (শান্তভাবে)', en: 'Practice' },
  'dashboard.practiceHubTitle': { bn: 'অনুশীলন ও মক টেস্ট কেন্দ্র', en: 'Practice & Mock Test Hub' },
  'dashboard.practiceHubDesc': { bn: 'পছন্দমতো যেকোনো বিষয় বেছে নিন অথবা ৫টি বিষয়ের সম্পূর্ণ টেট পরীক্ষার প্যাটার্নে পরীক্ষা দিন।', en: 'Choose a specific subject or take a balanced full test across all 5 Primary TET subjects.' },
  'dashboard.chooseSubject': { bn: '১. বিষয় বা পরীক্ষার প্যাটার্ন নির্বাচন করুন', en: '1. Select Subject or Exam Pattern' },
  'dashboard.mixedTetPattern': { bn: 'সম্পূর্ণ টেট পরীক্ষার প্যাটার্ন', en: 'Real TET Pattern' },
  'dashboard.mixedTetDesc': { bn: 'শিশু বিকাশ, বাংলা, ইংরেজি, গণিত ও পরিবেশের সমন্বয়', en: 'CDP, Bengali, English, Math & EVS' },
  'dashboard.weakSubjectBadge': { bn: 'বিশেষ অনুশীলন প্রয়োজন', en: 'Focus Area' },
  'dashboard.sourceLabel': { bn: 'প্রশ্নের উৎস', en: 'Question Source' },
  'dashboard.sourceAi': { bn: '✨ নতুন AI প্রশ্ন', en: '✨ Gemini AI' },
  'dashboard.sourcePyq': { bn: '🏛️ আসল টেটের প্রশ্ন (PYQ)', en: '🏛️ Authentic Past Papers' },
  'dashboard.questionCount': { bn: 'কয়টি প্রশ্ন সমাধান করবেন?', en: 'Questions' },
  'dashboard.questionCountShort': { bn: 'টি প্রশ্ন', en: 'Questions' },
  'dashboard.modeLabel': { bn: 'পরীক্ষার ধরন', en: 'Mode' },
  'dashboard.startSelectedBtn': { bn: 'পরীক্ষা শুরু করুন', en: 'Start Test Now' },
  'dashboard.reviewBtn': { bn: 'উত্তর দেখুন', en: 'Review Answers' },
  'dashboard.viewAllResults': { bn: 'সব ফলাফল দেখুন', en: 'View All Results' },
  'dashboard.allResultsModalTitle': { bn: 'সমস্ত পরীক্ষার ইতিহাস ও ফলাফল', en: 'All Quiz Results & History' },
  'dashboard.modalTotalTests': { bn: 'মোট পরীক্ষা', en: 'Total Tests' },
  'dashboard.modalClose': { bn: 'বন্ধ করুন', en: 'Close' },
  'dashboard.loginToViewHistory': { bn: 'পরীক্ষার হিস্ট্রি দেখতে লগইন করুন', en: 'Sign in to View Test History' },
  'dashboard.loginHistoryDesc': { bn: 'আপনার ফলাফল ও স্কোর নিরাপদে সংরক্ষণ করতে Google দিয়ে লগইন করুন।', en: 'Sign in with Google to safely save and track your personal quiz history and scores.' },

  // Create Quiz
  'create.title': { bn: 'কুইজ তৈরি করুন', en: 'Create Quiz' },
  'create.subtitle': { bn: 'আপনার সুবিধামত বিষয় ও প্রশ্নসংখ্যা নির্বাচন করে মক টেস্ট দিন', en: 'Configure your preferred subject, question count, and difficulty level' },
  'create.aiPowered': { bn: 'AI চালিত', en: 'AI Powered' },
  'create.step1Type': { bn: '১. কুইজের ধরন', en: '1. Quiz Type' },
  'create.subjectWise': { bn: 'বিষয়ভিত্তিক', en: 'Subject-wise' },
  'create.subjectWiseDesc': { bn: 'একটি নির্দিষ্ট বিষয় বেছে নিন', en: 'Choose a single subject' },
  'create.mixedQuiz': { bn: 'মিশ্র কুইজ', en: 'Mixed Quiz' },
  'create.mixedQuizDesc': { bn: '৫টি বিষয়ের সমন্বিত প্রশ্ন', en: 'Balanced questions across all 5 subjects' },
  'create.step2Subject': { bn: '২. বিষয় নির্বাচন করুন', en: '2. Select Subject' },
  'create.stepQuestions': { bn: 'প্রশ্নের সংখ্যা', en: 'Number of Questions' },
  'create.questionsUnit': { bn: 'টি প্রশ্ন', en: 'Questions' },
  'create.stepDifficulty': { bn: 'কাঠিন্য মান', en: 'Difficulty Level' },
  'create.diffEasy': { bn: 'সহজ', en: 'Easy' },
  'create.diffMedium': { bn: 'মাঝারি', en: 'Medium' },
  'create.diffHard': { bn: 'কঠিন', en: 'Hard' },
  'create.diffMixed': { bn: 'মিশ্র', en: 'Mixed' },
  'create.stepLanguage': { bn: 'কুইজের ভাষা', en: 'Quiz Language' },
  'create.langBengali': { bn: 'বাংলা', en: 'Bengali (বাংলা)' },
  'create.langEnglish': { bn: 'English', en: 'English' },
  'create.stepMode': { bn: 'পরীক্ষার মোড', en: 'Quiz Mode' },
  'create.practiceModeTitle': { bn: 'অনুশীলন মোড (সময়সীমা নেই)', en: 'Practice Mode' },
  'create.practiceModeDesc': { bn: 'কোনো নির্ধারিত সময়সীমা নেই। শান্তভাবে ভেবেচিন্তে উত্তর দিন।', en: 'No time limit. Practice at your own pace.' },
  'create.mockModeTitle': { bn: 'মক টেস্ট মোড (টাইমার সহ)', en: 'Mock Test Mode' },
  'create.mockModeDesc': { bn: 'টাইমার সহ আসল পরীক্ষার পরিবেশ। সময় শেষ হলে অটো সাবমিট হবে।', en: 'Timed exam with countdown timer. Automatically submits when time expires.' },
  'create.generateBtn': { bn: 'কুইজ শুরু করুন', en: 'Generate Quiz' },
  'create.generating': { bn: 'প্রশ্নপত্র প্রস্তুত করা হচ্ছে...', en: 'Generating your quiz...' },
  'create.stepLoader1': { bn: 'টেট সিলেবাস থেকে প্রশ্ন নির্বাচন করা হচ্ছে', en: 'Creating questions from TET syllabus' },
  'create.stepLoader2': { bn: 'সঠিক উত্তর ও সহজ ব্যাখ্যা প্রস্তুত হচ্ছে', en: 'Verifying answers and pedagogy' },
  'create.stepLoader3': { bn: 'কুইজ স্ক্রিন প্রস্তুত হচ্ছে...', en: 'Preparing your quiz interface' },

  // Quiz Screen
  'quiz.question': { bn: 'প্রশ্ন নম্বর', en: 'Question' },
  'quiz.of': { bn: 'এর মধ্যে', en: 'of' },
  'quiz.flag': { bn: 'পরে দেখব', en: 'Mark for Review' },
  'quiz.flagged': { bn: 'চিহ্নিত করা আছে', en: 'Marked' },
  'quiz.navigator': { bn: 'প্রশ্নের তালিকা দেখুন', en: 'Question Navigator' },
  'quiz.show': { bn: 'খুলুন', en: 'Show' },
  'quiz.hide': { bn: 'বন্ধ করুন', en: 'Hide' },
  'quiz.answered': { bn: 'উত্তর দেওয়া হয়েছে', en: 'Answered' },
  'quiz.unanswered': { bn: 'বাকি আছে', en: 'Unanswered' },
  'quiz.previous': { bn: '← আগের প্রশ্ন', en: 'Previous' },
  'quiz.next': { bn: 'পরের প্রশ্ন →', en: 'Next' },
  'quiz.submit': { bn: 'পরীক্ষা জমা দিন ✓', en: 'Submit Quiz' },
  'quiz.confirmTitle': { bn: 'আপনি কি পরীক্ষা জমা দিতে চান?', en: 'Ready to submit the test?' },
  'quiz.confirmBody': { bn: 'জমা দেওয়ার সাথে সাথে আপনি মোট স্কোর, সঠিক ও ভুল উত্তরের সংখ্যা এবং প্রতিটি প্রশ্নের সহজ ব্যাখ্যা দেখতে পাবেন।', en: 'After submitting, you will instantly receive your score, accuracy rate, and in-depth AI pedagogical explanations.' },
  'quiz.returnToQuiz': { bn: 'পরীক্ষায় ফিরুন', en: 'Back to Quiz' },
  'quiz.confirmSubmitBtn': { bn: 'হ্যাঁ, পরীক্ষা জমা দিন', en: 'Yes, Submit' },

  // Results
  'result.completed': { bn: 'পরীক্ষা সম্পন্ন হয়েছে!', en: 'Quiz Completed!' },
  'result.greatJob': { bn: 'চমৎকার পরীক্ষা দিয়েছেন! চালিয়ে যান', en: 'Great Performance!' },
  'result.needPractice': { bn: 'খুব ভালো হয়েছে! আরও একটু অনুশীলন প্রয়োজন', en: 'Keep Practicing!' },
  'result.score': { bn: 'প্রাপ্ত নম্বর', en: 'Score' },
  'result.accuracy': { bn: 'সঠিকতার হার', en: 'Accuracy' },
  'result.correct': { bn: 'সঠিক উত্তর', en: 'Correct' },
  'result.incorrect': { bn: 'ভুল উত্তর', en: 'Incorrect' },
  'result.skipped': { bn: 'উত্তর দেননি', en: 'Skipped' },
  'result.timeTaken': { bn: 'নেওয়া সময়', en: 'Time Taken' },
  'result.reviewAnswers': { bn: 'উত্তর ও ব্যাখ্যা দেখুন', en: 'Review Answers' },
  'result.tryAgain': { bn: 'আবার পরীক্ষা দিন', en: 'Try Again' },
  'result.newQuiz': { bn: 'নতুন পরীক্ষা শুরু করুন', en: 'New Quiz' },
  'result.dashboard': { bn: 'হোমে ফিরুন', en: 'Dashboard' },
  'result.subjectPerf': { bn: 'বিষয়ভিত্তিক মূল্যায়ন', en: 'Subject-wise Performance' },
  'result.aiDiagnosisTitle': { bn: '🤖 Gemini AI প্রস্তুতি মূল্যায়ন ও উন্নতির পরামর্শ', en: '🤖 Gemini AI Performance Analysis & Improvement Roadmap' },
  'result.aiGeneratingDiagnosis': { bn: 'AI শিক্ষক আপনার ফলাফল বিশ্লেষণ করছেন...', en: 'AI Mentor is analyzing your test results...' },
  'result.aiDiagnosisError': { bn: 'বিশ্লেষণ তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', en: 'Failed to generate AI diagnosis.' },
  'result.weakAreaHeader': { bn: 'যে যে বিষয়ে আরও অনুশীলন প্রয়োজন:', en: 'Areas that need more practice:' },
  'result.strongAreaHeader': { bn: 'আপনার শক্তিশালী ক্ষেত্র:', en: 'Your strong areas:' },
  'result.drillWeakSubjectBtn': { bn: '🎯 দুর্বল বিষয়ের ওপর ১০টি AI প্রশ্ন দিয়ে প্র্যাকটিস করুন', en: '🎯 Start 10-Q AI Practice on Weak Subject' },
  'result.generatingDrill': { bn: '১০টি বিশেষ প্র্যাকটিস প্রশ্ন তৈরি হচ্ছে...', en: 'Generating 10 targeted drill questions...' },
  'result.getAiMentorBtn': { bn: '✨ Gemini AI শিক্ষকের বিশদ পরামর্শ নিন', en: '✨ Get Detailed AI Mentor Advice' },
  'result.missedTopicsTitle': { bn: 'ভুল হওয়া প্রশ্ন ও ধারণাসমূহ:', en: 'Missed Topics & Concepts:' },

  // Review
  'review.title': { bn: 'উত্তর ও সহজ ব্যাখ্যা', en: 'Review Answers' },
  'review.backToResult': { bn: 'ফলাফলে ফিরুন', en: 'Back to Results' },
  'review.all': { bn: 'সব প্রশ্ন', en: 'All Questions' },
  'review.correct': { bn: 'সঠিক উত্তর', en: 'Correct' },
  'review.incorrect': { bn: 'ভুল উত্তর', en: 'Incorrect' },
  'review.skipped': { bn: 'দেওয়া হয়নি', en: 'Skipped' },
  'review.explanation': { bn: 'সহজ ব্যাখ্যা:', en: 'Explanation:' },
  'review.aiExplanationTitle': { bn: 'সহজ AI শিক্ষাতাত্ত্বিক ব্যাখ্যা:', en: 'Gemini AI Pedagogical Explanation:' },
  'review.explainWithAi': { bn: '💡 সহজ করে বুঝিয়ে দিন', en: '💡 Explain with AI' },
  'review.generatingExp': { bn: 'সহজ ব্যাখ্যা তৈরি হচ্ছে...', en: 'Generating explanation...' },
  'review.similarQBtn': { bn: '⚡ এই প্রশ্ন সম্পর্কিত আরও ১০টি প্রশ্ন অভ্যাস করুন', en: '⚡ Practice 10 Questions on this Topic' },
  'review.similarQuizBtn': { bn: '⚡ এই প্রশ্ন সম্পর্কিত আরও ১০টি প্রশ্ন অভ্যাস করুন', en: '⚡ Practice 10 Questions on this Topic' },
  'review.learnTopicBtn': { bn: '🧠 এই বিষয়টি শিখুন (AI স্টাডি নোট)', en: '🧠 Learn this Topic (AI Study Notes)' },
  'review.generatingSimilarQuiz': { bn: 'একই ধরণের ১০টি প্রশ্ন তৈরি হচ্ছে...', en: 'Generating 10 similar questions...' },
  'review.similarQTitle': { bn: 'একই ধারণার অনুশীলন প্রশ্ন', en: 'AI Similar Practice Question' },
  'review.correctMark': { bn: 'সঠিক উত্তর ✓', en: 'Correct ✓' },
  'review.wrongMark': { bn: 'ভুল উত্তর ✗', en: 'Incorrect ✗' },
  'review.notAttempted': { bn: 'উত্তর দেননি', en: 'Not Attempted' },

  // Quiz Screen Instant Feedback
  'quiz.instantFeedback': { bn: 'তাৎক্ষণিক ধারণা ও বিশ্লেষণ', en: 'Instant Concept Insight' },
  'quiz.learnTopicBtn': { bn: '🧠 এই বিষয়টি শিখুন (AI স্টাডি নোট)', en: '🧠 Learn this Topic (AI Study Notes)' },
  'quiz.practiceSimilarBtn': { bn: '⚡ আরও ১০টি সম্পর্কিত প্রশ্ন অভ্যাস করুন', en: '⚡ Practice 10 More Questions' },

  // Study Vault & AI Topic Notes
  'notes.title': { bn: 'AI স্টাডি নোটস ও কনসেপ্ট টিউটর', en: 'AI Topic Tutor & Study Notes' },
  'notes.subtitle': { bn: 'টেট পরীক্ষার জন্য সম্পূর্ণ কনসেপ্ট, শ্রেণিকক্ষের প্রয়োগ ও শর্টকাট কৌশল', en: 'In-depth pedagogy, formulas, examples & memory mnemonics' },
  'notes.teachingAbout': { bn: 'মূল শিক্ষাতাত্ত্বিক ধারণা', en: 'Core Pedagogical Concept' },
  'notes.coreConcept': { bn: 'মূল ধারণা ও সারসংক্ষেপ', en: 'Core Concept & Foundation' },
  'notes.keyPoints': { bn: 'গুরুত্বপূর্ণ নিয়ম, সূত্র ও শিক্ষাতত্ত্ব', en: 'Key Rules, Principles & Pedagogy' },
  'notes.realLifeExample': { bn: 'শ্রেণিকক্ষের বাস্তব প্রয়োগ ও উদাহরণ', en: 'Classroom Example & Application' },
  'notes.memoryMnemonics': { bn: 'মনে রাখার সহজ কৌশল / শর্টকাট ট্রিকস', en: 'Memory Mnemonics & Shortcut Tricks' },
  'notes.commonMistakes': { bn: 'টেট পরীক্ষায় সাধারণ ভুল ও সতর্কতা', en: 'Common Exam Mistakes to Avoid' },
  'notes.examTakeaways': { bn: 'দ্রুত রিভিশন পয়েন্টস', en: 'Quick Revision Takeaways' },
  'notes.saveBtn': { bn: 'টপিকটি সংরক্ষণ করুন', en: 'Save Topic to Vault' },
  'notes.savedSuccess': { bn: 'সংরক্ষিত হয়েছে', en: 'Saved in Notes' },
  'notes.alreadySaved': { bn: 'আগেই সংরক্ষিত আছে', en: 'Already in Vault' },
  'notes.practiceDrillBtn': { bn: 'এই টপিকের ওপর ১০টি প্রশ্ন অভ্যাস করুন', en: 'Practice 10 Questions on this Topic' },
  'notes.generating': { bn: 'Gemini AI শিক্ষক আপনার জন্য সহজ নোট ও মনে রাখার কৌশল প্রস্তুত করছেন...', en: 'Gemini AI mentor is crafting your study guide & memory tricks...' },
  'notes.generatingQuiz': { bn: 'এই টপিকের ১০টি প্রশ্ন প্রস্তুত করা হচ্ছে...', en: 'Generating 10 questions for this topic...' },
  'notes.copied': { bn: 'নোট কপি করা হয়েছে!', en: 'Note copied to clipboard!' },
  'notes.copyBtn': { bn: 'নোট কপি করুন', en: 'Copy Notes' },
  'notes.deleteBtn': { bn: 'মুছুন', en: 'Delete Note' },
  'notes.confirmDelete': { bn: 'আপনি কি নিশ্চিত যে এই স্টাডি নোটটি মুছে ফেলতে চান?', en: 'Are you sure you want to delete this study note?' },
  'notes.searchPlaceholder': { bn: 'সংরক্ষিত নোট বা টপিক খুঁজুন...', en: 'Search saved topics, concepts, or rules...' },
  'notes.filterAll': { bn: 'সব বিষয়', en: 'All Subjects' },
  'notes.emptyTitle': { bn: 'আপনার স্টাডি ভল্ট খালি', en: 'Your Study Vault is Empty' },
  'notes.emptyDesc': { bn: 'পরীক্ষা দেওয়ার সময় বা রিভিউ করার সময় "🧠 এই বিষয়টি শিখুন" বাটনে ক্লিক করে যেকোনো টপিকের বিশদ নোট এখানে সংরক্ষণ করতে পারেন।', en: 'While taking exams or reviewing answers, click "🧠 Learn this Topic" to generate and save in-depth study notes here.' },
  'notes.startQuizFromNote': { bn: '১০টি প্রশ্ন সমাধান করুন', en: 'Solve 10 Questions' },
  'notes.vaultBadge': { bn: 'ব্যক্তিগত স্টাডি ভল্ট', en: 'Personal Study Vault' },
  'notes.savedOn': { bn: 'সংরক্ষণের তারিখ', en: 'Saved on' },
  'notes.sourceQ': { bn: 'উৎস প্রশ্ন', en: 'Source Question' },
  'notes.expand': { bn: 'সম্পূর্ণ নোট দেখুন', en: 'Read Full Note' },
  'notes.collapse': { bn: 'সংক্ষেপ করুন', en: 'Collapse' },
  'notes.totalNotes': { bn: 'মোট সংরক্ষিত বিষয়', en: 'Total Saved Topics' },


  // Previous Year Questions
  'pyq.title': { bn: 'বিগত বছরের টেট প্রশ্নপত্র (PYQ)', en: 'Previous Year Questions (PYQ)' },
  'pyq.subtitle': { bn: 'পশ্চিমবঙ্গ প্রাথমিক টেটের ২০১৪ থেকে ২০২৩ সালের আসল প্রশ্নপত্র ও সহজ সমাধান Gemini AI দ্বারা অনুশীলন করুন।', en: 'Practice authentic West Bengal Primary TET question papers from 2014 to 2023 with step-by-step Gemini AI explanations.' },
  'pyq.realBadge': { bn: 'আসল পরীক্ষার প্রশ্ন (PYQ)', en: 'Verified Past Papers' },
  'pyq.datasetBadge': { bn: 'Gemini AI চালিত', en: 'Powered by Gemini AI' },
  'pyq.startMockBtn': { bn: 'এই প্রশ্নগুলি দিয়ে মক টেস্ট দিন', en: 'Take Mock Test with These Questions' },
  'pyq.yearLabel': { bn: 'বছর নির্বাচন করুন', en: 'Year' },
  'pyq.allYears': { bn: 'সব বছর (২০১৪-২০২৩)', en: 'All Years' },
  'pyq.subjectLabel': { bn: 'বিষয়', en: 'Subject' },
  'pyq.allSubjects': { bn: 'সব বিষয়', en: 'All Subjects' },
  'pyq.diffLabel': { bn: 'সহজ / কঠিন', en: 'Difficulty' },
  'pyq.searchPlaceholder': { bn: 'প্রশ্ন খুঁজুন...', en: 'Search question or topic...' },
  'pyq.resetFilters': { bn: 'সব ফিল্টার মুছুন', en: 'Reset Filters' },
  'pyq.revealAnswer': { bn: '👁️ উত্তর ও ব্যাখ্যা দেখুন', en: 'Reveal Answer & Explanation' },
  'pyq.hideAnswer': { bn: '🙈 উত্তর লুকান', en: 'Hide Answer' },
  'pyq.aiFetchBtn': { bn: '✨ Gemini AI দিয়ে এই সালের প্রশ্ন আনুন', en: '✨ Load Questions with Gemini AI' },
  'pyq.aiMockBtn': { bn: '⏱️ এই সালের মক টেস্ট শুরু করুন', en: '⏱️ Start Mock Test for This Year' },
  'pyq.aiPracticeBtn': { bn: '📝 শান্তভাবে সমাধান করুন', en: '📝 Practice Questions' },
  'pyq.selectYearHeading': { bn: '১. টেট পরীক্ষার বছর বেছে নিন', en: '1. Select TET Exam Year' },
  'pyq.selectSubjectHeading': { bn: '২. বিষয় নির্বাচন করুন', en: '2. Select Subject' },
  'pyq.all5Subjects': { bn: 'সম্পূর্ণ ৫টি বিষয় (সম্পূর্ণ টেট প্রশ্নপত্র)', en: 'All 5 Core Subjects (Full TET Paper)' },
  'pyq.loadingAi': { bn: 'Gemini AI বিগত বছরের প্রশ্নপত্র বিশ্লেষণ ও প্রস্তুত করছে...', en: 'Gemini AI is analyzing and generating the exam paper...' },
  'pyq.aiGeneratedBadge': { bn: 'Gemini AI বিশ্লেষিত প্রশ্ন', en: 'Gemini AI Verified' },

  // Settings Modal
  'settings.title': { bn: 'Gemini AI সেটিংস (Settings)', en: 'Gemini AI Settings' },
  'settings.securityTitle': { bn: 'সুরক্ষা বার্তা (Security Notice):', en: 'Security Notice:' },
  'settings.securityMsg': { bn: 'আপনার API Key টি শুধুমাত্র আপনার ব্রাউজারের লোকাল স্টোরেজে সংরক্ষিত থাকে।', en: 'Your API key is stored locally in your browser storage and passed directly to Gemini API.' },
  'settings.apiKeyLabel': { bn: 'Gemini API Key', en: 'Gemini API Key' },
  'settings.apiKeyHelp': { bn: 'গুগল এআই স্টুডিও থেকে সম্পূর্ণ বিনামূল্যে আপনার API Key সংগ্রহ করতে পারেন।', en: 'You can get a free API key from Google AI Studio.' },
  'settings.modelLabel': { bn: 'Gemini Model', en: 'Gemini Model' },
  'settings.statusLabel': { bn: 'বর্তমান স্ট্যাটাস:', en: 'Current Status:' },
  'settings.statusActive': { bn: 'API Key সক্রিয়', en: 'API Key Active' },
  'settings.statusOffline': { bn: 'অফলাইন / ফলব্যাক মোড', en: 'Offline / Fallback Mode' },
  'settings.statusHelp': { bn: 'API Key না থাকলেও আপনি অ্যাপের ভেতরে থাকা সমৃদ্ধ ৫০+ টেট প্রশ্ন ভাণ্ডার থেকে অফলাইনে সম্পূর্ণ অনুশীলন করতে পারবেন।', en: 'Even without an API key, you can practice seamlessly with 50+ built-in Primary TET questions.' },
  'settings.closeBtn': { bn: 'বন্ধ করুন', en: 'Close' },
  'settings.saveBtn': { bn: 'সংরক্ষণ করুন', en: 'Save Settings' }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY_LANG = 'tet_master_active_lang';
  private currentLangSubject = new BehaviorSubject<AppLanguage>('bn');
  public currentLang$: Observable<AppLanguage> = this.currentLangSubject.asObservable();

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY_LANG) as AppLanguage;
    if (saved && (saved === 'bn' || saved === 'en')) {
      this.currentLangSubject.next(saved);
    } else {
      this.currentLangSubject.next('bn'); // Default Bengali as required
    }
  }

  public get currentLanguage(): AppLanguage {
    return this.currentLangSubject.value;
  }

  public setLanguage(lang: AppLanguage): void {
    if (lang === 'bn' || lang === 'en') {
      this.currentLangSubject.next(lang);
      try {
        localStorage.setItem(this.STORAGE_KEY_LANG, lang);
      } catch (e) {
        console.error('Failed to save language preference', e);
      }
    }
  }

  public toggleLanguage(): void {
    const next = this.currentLanguage === 'bn' ? 'en' : 'bn';
    this.setLanguage(next);
  }

  public translate(key: string): string {
    const item = TRANSLATION_DICTIONARY[key];
    if (!item) {
      return key;
    }
    return item[this.currentLanguage] || item.bn || key;
  }

  public t(key: string): string {
    return this.translate(key);
  }
}
