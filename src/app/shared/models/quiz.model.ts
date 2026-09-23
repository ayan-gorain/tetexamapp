export type TETSubject =
  | 'Bengali'
  | 'Mathematics'
  | 'Child Development & Pedagogy'
  | 'Environmental Studies'
  | 'English';

export const TET_SUBJECTS: { id: TETSubject; nameEn: string; nameBn: string; icon: string; color: string }[] = [
  { id: 'Child Development & Pedagogy', nameEn: 'Child Development & Pedagogy', nameBn: 'শিশু বিকাশ ও শিক্ষাতত্ত্ব (CDP)', icon: 'bi-person-hearts', color: '#8b5cf6' },
  { id: 'Bengali', nameEn: 'Bengali', nameBn: 'বাংলা ভাষা ও সাহিত্য', icon: 'bi-book-half', color: '#059669' },
  { id: 'English', nameEn: 'English', nameBn: 'ইংরেজি ভাষা (English)', icon: 'bi-translate', color: '#2563eb' },
  { id: 'Mathematics', nameEn: 'Mathematics', nameBn: 'গণিত ও পেডাগজি', icon: 'bi-calculator', color: '#d97706' },
  { id: 'Environmental Studies', nameEn: 'Environmental Studies', nameBn: 'পরিবেশ বিদ্যা (EVS)', icon: 'bi-tree', color: '#0d9488' }
];

export interface QuizQuestion {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed: 0, 1, 2, 3
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
}

export interface QuizResponse {
  quizTitle: string;
  language: string;
  questions: QuizQuestion[];
}

export interface QuizConfig {
  quizType: 'subject' | 'mixed';
  subject?: TETSubject | string;
  numberOfQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  language: 'Bengali' | 'English';
  mode: 'practice' | 'mock';
}

export interface QuizAttempt {
  id: string;
  userId?: string;
  quizTitle: string;
  quizType: 'subject' | 'mixed';
  subjects: string[];
  score: number;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  timeTakenSeconds: number;
  date: string;
  mode: 'practice' | 'mock';
  questions: QuizQuestion[];
  userAnswers: { [questionId: number]: number }; // questionId -> selected option index (-1 for unselected)
}

export interface SubjectPerformance {
  subject: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
}

export interface UserStats {
  totalQuizzes: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  currentStreak: number;
  lastQuizDate?: string;
  subjectStats: {
    [subjectName: string]: {
      attempted: number;
      correct: number;
    }
  };
}

export interface PreviousYearQuestion {
  id: string | number;
  year: number;
  examName: string;
  subject: TETSubject | string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
}

export interface TopicNote {
  id: string;
  userId?: string;
  topicTitle: string;
  subject: TETSubject | string;
  sourceQuestion?: string;
  sourceExplanation?: string;
  coreConcept: string;
  keyPoints: string[];
  realLifeExample?: string;
  memoryMnemonics?: string;
  commonMistakes?: string[];
  examTakeaways: string[];
  savedAt: string;
  language?: 'Bengali' | 'English';
  tags?: string[];
}

