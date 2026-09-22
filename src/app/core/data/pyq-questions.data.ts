import { PreviousYearQuestion } from '../../shared/models/quiz.model';

export const PYQ_DATABASE: PreviousYearQuestion[] = [
  // 2023 WB Primary TET Questions
  {
    id: 'pyq-2023-cdp-1',
    year: 2023,
    examName: 'WB Primary TET 2023',
    subject: 'Child Development & Pedagogy',
    topic: 'বিকাশের নীতি ও ধারণা',
    question: 'শিশুর বিকাশ প্রক্রিয়ায় "সেফালোকডাল নীতি" (Cephalocaudal principle) বলতে কী বোঝায়?',
    options: [
      'কেন্দ্র থেকে প্রান্তীয় অংশের বিকাশ',
      'মস্তক থেকে পদতলের দিকে বিকাশ',
      'সাধারণ থেকে বিশেষ প্রতিক্রিয়ার বিকাশ',
      'দৈহিক বৃদ্ধির আকস্মিক পরিবর্তন'
    ],
    correctAnswer: 1,
    explanation: 'সেফালোকডাল নীতি অনুযায়ী শিশুর শারীরিক ও চালকমূলক বিকাশ মাথা (head) থেকে শুরু হয়ে নিচের দিকে পায়ের (foot) অভিমুখে অগ্রসর হয়।',
    difficulty: 'Medium'
  },
  {
    id: 'pyq-2023-math-1',
    year: 2023,
    examName: 'WB Primary TET 2023',
    subject: 'Mathematics',
    topic: 'সংখ্যা তত্ত্ব ও মৌলিক সংখ্যা',
    question: '১ থেকে ১০০ এর মধ্যে মোট কতগুলি মৌলিক সংখ্যা (Prime Numbers) বিদ্যমান?',
    options: ['২১ টি', '২৩ টি', '২৫ টি', '২৭ টি'],
    correctAnswer: 2,
    explanation: '১ থেকে ১০০ এর মধ্যে মোট ২৫টি মৌলিক সংখ্যা রয়েছে (যেমন: ২, ৩, ৫, ৭, ১১, ১৩, ১৭, ১৯, ২৩, ২৯, ৩১, ৩৭, ৪১, ৪৩, ৪৭, ৫৩, ৫৯, ৬১, ৬৭, ৭১, ৭৩, ৭৯, ৮৩, ৮৯, ৯৭)।',
    difficulty: 'Easy'
  },
  {
    id: 'pyq-2023-evs-1',
    year: 2023,
    examName: 'WB Primary TET 2023',
    subject: 'Environmental Studies',
    topic: 'বাস্তুতন্ত্র ও শক্তিপ্রবাহ',
    question: 'বাস্তুতন্ত্রের খাদ্যশৃঙ্খলে প্রতি ধাপে কত শতাংশ শক্তি পরবর্তী পুষ্টিস্তরে স্থানান্তরিত হয় (লিন্ডেম্যানের ১০% সূত্র)?',
    options: ['১%', '৫%', '১০%', '২০%'],
    correctAnswer: 2,
    explanation: 'রেমন্ড লিন্ডেম্যান (1942) এর ১০% নিয়ম অনুসারে এক ট্রফিক লেভেল থেকে পরবর্তী ট্রফিক লেভেলে গড়ে মাত্র ১০% শক্তি সঞ্চালিত হয়।',
    difficulty: 'Easy'
  },
  {
    id: 'pyq-2023-ben-1',
    year: 2023,
    examName: 'WB Primary TET 2023',
    subject: 'Bengali',
    topic: 'ধ্বনি ও বর্ণ প্রকরণ',
    question: 'বাংলা ব্যাকরণে "ড়" এবং "ঢ়" ধ্বনি দুটিকে কী ধরনের ধ্বনি বলা হয়?',
    options: ['উষ্ম ধ্বনি', 'তাড়নজাত ধ্বনি', 'কম্পনজাত ধ্বনি', 'নাসিক্য ধ্বনি'],
    correctAnswer: 1,
    explanation: 'জিহ্বার ডগা ওপরের মাড়ি বা তালুতে দ্রুত এক বা একাধিকবার আঘাত করে বা তাড়া দিয়ে উচ্চারিত হয় বলে "ড়" ও "ঢ়"-কে তাড়নজাত ধ্বনি বলা হয়।',
    difficulty: 'Medium'
  },
  {
    id: 'pyq-2023-eng-1',
    year: 2023,
    examName: 'WB Primary TET 2023',
    subject: 'English',
    topic: 'Pedagogy of Language Development',
    question: 'Which learning theory emphasizes "Scaffolding" and the "More Knowledgeable Other (MKO)"?',
    options: [
      'Jean Piaget\'s Theory',
      'Lev Vygotsky\'s Socio-Cultural Theory',
      'B.F. Skinner\'s Operant Conditioning',
      'Noam Chomsky\'s LAD'
    ],
    correctAnswer: 1,
    explanation: 'Lev Vygotsky introduced Scaffolding (temporary structured support) and MKO (guidance from a more capable peer or adult) in his Socio-Cultural Theory.',
    difficulty: 'Easy'
  },

  // 2022 WB Primary TET Questions
  {
    id: 'pyq-2022-cdp-1',
    year: 2022,
    examName: 'WB Primary TET 2022',
    subject: 'Child Development & Pedagogy',
    topic: 'কোহলবার্গের নৈতিক বিকাশ',
    question: 'কোহলবার্গের মতে নৈতিক বিকাশের তৃতীয় স্তর বা "উত্তর-প্রথাগত স্তর" (Post-conventional level)-এর মূল বৈশিষ্ট্য কী?',
    options: [
      'শাস্তি এড়ানো ও পুরস্কার প্রাপ্তি',
      'সামাজিক নিয়মকানুন অন্ধভাবে মানা',
      'সর্বজনীন নৈতিক নীতি ও বিবেকবোধের ভিত্তিতে সিদ্ধান্ত',
      'আত্মকেন্দ্রিক আচরণ'
    ],
    correctAnswer: 2,
    explanation: 'উত্তর-প্রথাগত স্তরে ব্যক্তি আইন ও নিয়মকে অন্ধভাবে না মেনে মানবিক ন্যায়বিচার, সমতা ও সর্বজনীন মানবিক মূল্যবোধ দ্বারা চালিত হয়।',
    difficulty: 'Medium'
  },
  {
    id: 'pyq-2022-math-1',
    year: 2022,
    examName: 'WB Primary TET 2022',
    subject: 'Mathematics',
    topic: 'ভগ্নাংশ ও দশমিক',
    question: '০.১ এর বর্গ এবং ০.০১ এর বর্গমূলের যোগফল কত?',
    options: ['০.১১', '০.০১১', '১.০১', '০.১২'],
    correctAnswer: 0,
    explanation: '(০.১)² = ০.০১ এবং √(০.০১) = ০.১। যোগফল = ০.০১ + ০.১ = ০.১১।',
    difficulty: 'Easy'
  },
  {
    id: 'pyq-2022-evs-1',
    year: 2022,
    examName: 'WB Primary TET 2022',
    subject: 'Environmental Studies',
    topic: 'জলদূষণ ও রোগ',
    question: 'পানীয় জলে অতিরিক্ত কোন উপাদানের উপস্থিতির কারণে "ব্ল্যাক ফুট" (Black Foot) রোগ দেখা যায়?',
    options: ['ফ্লুরাইড', 'আর্সেনিক', 'পারদ', 'সীসা'],
    correctAnswer: 1,
    explanation: 'পানীয় জলে দীর্ঘমেয়াদী আর্সেনিক বিষক্রিয়ার (Arsenicosis) ফলে হাতের তালু ও পায়ের তলায় কালচে দাগ ও ক্ষতের সৃষ্টি হয়, যা ব্ল্যাক ফুট রোগ নামে পরিচিত।',
    difficulty: 'Easy'
  },
  {
    id: 'pyq-2022-ben-1',
    year: 2022,
    examName: 'WB Primary TET 2022',
    subject: 'Bengali',
    topic: 'সমাজ ও পদ পরিচয়',
    question: '"পদ্মনাভ" কোন সমাসের দৃষ্টান্ত?',
    options: ['কর্মধারয়', 'তৎপুরুষ', 'বহুব্রীহি', 'দ্বিগু'],
    correctAnswer: 2,
    explanation: 'পদ্মে নাভি যার = পদ্মনাভ (ভগবান বিষ্ণু)। এখানে পূর্বপদ বা পরপদ কোনোটির অর্থ না বুঝিয়ে তৃতীয় ভিন্ন অর্থ প্রকাশ করায় এটি ব্যাধিকরণ বহুব্রীহি সমাস।',
    difficulty: 'Medium'
  },
  {
    id: 'pyq-2022-eng-1',
    year: 2022,
    examName: 'WB Primary TET 2022',
    subject: 'English',
    topic: 'Grammar - Parts of Speech',
    question: 'In the sentence "He is the best teacher in our school", what part of speech is "best"?',
    options: ['Adverb', 'Adjective (Superlative)', 'Noun', 'Pronoun'],
    correctAnswer: 1,
    explanation: '"Best" modifies the noun "teacher" and is the superlative degree of the adjective "good".',
    difficulty: 'Easy'
  },

  // 2017 & 2021 WB Primary TET Questions
  {
    id: 'pyq-2021-cdp-1',
    year: 2021,
    examName: 'WB Primary TET 2021',
    subject: 'Child Development & Pedagogy',
    topic: 'শিক্ষণ পদ্ধতি ও শিখন তত্ত্ব',
    question: 'থর্নডাইকের (Thorndike) শিখনের মুখ্য সূত্রগুলির মধ্যে কোনটি সবচেয়ে বেশি অনুপ্রেরণামূলক?',
    options: ['অনুশীলনের সূত্র', 'ফললাভের সূত্র (Law of Effect)', 'প্রস্তুতির সূত্র', 'অনুরূপতার সূত্র'],
    correctAnswer: 1,
    explanation: 'ফললাভের সূত্র অনুসারে যে আচরণে শিক্ষার্থী সন্তুষ্টি বা ইতিবাচক ফল লাভ করে, সেই আচরণটি পুনরায় ঘটার সম্ভাবনা বৃদ্ধি পায়।',
    difficulty: 'Medium'
  },
  {
    id: 'pyq-2021-math-1',
    year: 2021,
    examName: 'WB Primary TET 2021',
    subject: 'Mathematics',
    topic: 'শতকরা ও লাভ-ক্ষতি',
    question: 'একটি সামগ্রী ৪০০ টাকায় কিনে ৪৮০ টাকায় বিক্রি করলে শতকরা কত লাভ হবে?',
    options: ['১৫%', '১৮%', '২০%', '২৫%'],
    correctAnswer: 2,
    explanation: 'লাভ = ৪৮০ - ৪০০ = ৮০ টাকা। শতকরা লাভ = (৮০ ÷ ৪০০) × ১০০% = ২০%।',
    difficulty: 'Easy'
  },
  {
    id: 'pyq-2021-evs-1',
    year: 2021,
    examName: 'WB Primary TET 2021',
    subject: 'Environmental Studies',
    topic: 'বায়ুমণ্ডল ও ওজোন স্তর',
    question: 'বায়ুমণ্ডলের ওজোন স্তর (Ozone Layer) প্রধানত কোন অতিবেগুনী রশ্মিকে ভূপৃষ্ঠে আসতে বাধা দেয়?',
    options: ['ইনফ্রারেড রশ্মি', 'UV-B ও ক্ষতিকর UV রশ্মি', 'গামা রশ্মি', 'এক্স রশ্মি'],
    correctAnswer: 1,
    explanation: 'স্ট্র্যাটোস্ফিয়ারে অবস্থিত ওজোন স্তর সূর্য থেকে আগত ক্ষতিকর অতিবেগুনী বিকিরণ শোষণ করে পৃথিবীর জীবজগৎকে রক্ষা করে।',
    difficulty: 'Easy'
  },
  {
    id: 'pyq-2017-ben-1',
    year: 2017,
    examName: 'WB Primary TET 2017',
    subject: 'Bengali',
    topic: 'কারক ও বিভক্তি',
    question: '"তিলে তৈল হয়" — এখানে "তিলে" কোন কারকে কোন বিভক্তি?',
    options: ['অধিকরণে এ', 'অপাদানে এ', 'করণে এ', 'কর্মে এ'],
    correctAnswer: 1,
    explanation: 'তিল থেকে তেল নিষ্কাশিত বা উৎপন্ন হয়। কোনো কিছু থেকে উৎপন্ন, বিচ্যুত বা গৃহীত বোঝাতে অপাদান কারক হয়। তিল + এ বিভক্তি।',
    difficulty: 'Medium'
  },
  {
    id: 'pyq-2017-eng-1',
    year: 2017,
    examName: 'WB Primary TET 2017',
    subject: 'English',
    topic: 'Vocabulary & Synonyms',
    question: 'What is the synonym of the word "DILIGENT"?',
    options: ['Lazy', 'Hardworking / Industrious', 'Careless', 'Passive'],
    correctAnswer: 1,
    explanation: '"Diligent" means showing care and conscientiousness in one\'s work or duties (Hardworking).',
    difficulty: 'Easy'
  }
];
