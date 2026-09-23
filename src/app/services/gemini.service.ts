import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { QuizQuestion, QuizResponse, QuizAttempt, PreviousYearQuestion, TET_SUBJECTS, TopicNote } from '../shared/models/quiz.model';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  constructor(private http: HttpClient) {}

  /**
   * Get the active API Key from environment
   */
  public getApiKey(): string {
    return environment.geminiApiKey || '';
  }

  /**
   * Get the active Gemini model name
   */
  public getModelName(): string {
    return environment.geminiModel || 'gemini-3.6-flash';
  }

  /**
   * Generate a Subject-wise Quiz in either Bengali or English.
   * Returns real Gemini output and propagates real errors if the API fails (no dummy data).
   */
  public generateSubjectQuiz(
    subject: string,
    numberOfQuestions: number = 10,
    difficulty: string = 'Medium',
    language: string = 'Bengali'
  ): Observable<QuizResponse> {
    const prompt = this.buildSubjectQuizPrompt(subject, numberOfQuestions, difficulty, language);
    return this.callGeminiApi(prompt).pipe(
      map(rawResponse => this.parseAndValidateQuizResponse(rawResponse, `Primary TET ${subject} Quiz`, language))
    );
  }

  /**
   * Generate a Mixed Subject Quiz across all 5 TET subjects.
   * Returns real Gemini output and propagates real errors if the API fails (no dummy data).
   */
  public generateMixedQuiz(
    numberOfQuestions: number = 10,
    difficulty: string = 'Mixed',
    language: string = 'Bengali'
  ): Observable<QuizResponse> {
    const prompt = this.buildMixedQuizPrompt(numberOfQuestions, difficulty, language);
    return this.callGeminiApi(prompt).pipe(
      map(rawResponse => this.parseAndValidateQuizResponse(rawResponse, 'Primary TET Mixed Mock Quiz', language))
    );
  }

  /**
   * Generate authentic PreviousYearQuestion array for a specific TET Year, Subject, and Topic using Gemini AI.
   * Returns strongly-typed PreviousYearQuestion[] objects with topic, examName, and detailed explanations.
   */
  public generatePreviousYearQuestions(
    year: number | string,
    subject: string = 'all',
    numberOfQuestions: number = 10,
    topic?: string,
    language: string = 'Bengali'
  ): Observable<PreviousYearQuestion[]> {
    const prompt = this.buildPyqPrompt(year, subject, numberOfQuestions, language, topic);
    return this.callGeminiApi(prompt).pipe(
      map(rawResponse => this.parseAndValidatePyqResponse(rawResponse, Number(year) || 2023, subject, language))
    );
  }

  /**
   * Generate authentic Previous Year Questions (PYQ) for a specific TET Year and Subject using Gemini AI.
   */
  public generatePyqQuiz(
    year: number | string,
    subject: string = 'all',
    numberOfQuestions: number = 10,
    language: string = 'Bengali'
  ): Observable<QuizResponse> {
    const prompt = this.buildPyqPrompt(year, subject, numberOfQuestions, language);
    return this.callGeminiApi(prompt).pipe(
      map(rawResponse => this.parseAndValidateQuizResponse(rawResponse, `WB Primary TET ${year} Question Paper`, language))
    );
  }

  /**
   * Generate a pedagogical AI explanation in Bengali or English.
   */
  public generateExplanation(
    question: string,
    options: string[],
    correctAnswer: number,
    userAnswer?: number,
    language: string = 'Bengali'
  ): Observable<string> {
    const isEn = language.toLowerCase() === 'english';
    const prompt = `
You are an expert Primary TET mentor and teacher educator.
Provide a clear, concise, and pedagogical explanation in ${isEn ? 'English' : 'Bengali (বাংলা)'} for the following Primary TET question:

Question: ${question}
Options:
1) ${options[0]}
2) ${options[1]}
3) ${options[2]}
4) ${options[3]}

Correct Option: Option ${correctAnswer + 1} (${options[correctAnswer]})
${userAnswer !== undefined && userAnswer !== correctAnswer ? `The student mistakenly chose: Option ${userAnswer + 1} (${options[userAnswer]}). Explain why that is incorrect and why the correct answer is right.` : ''}

Requirements:
- Explain in simple, lucid ${isEn ? 'English' : 'Bengali (বাংলা)'}.
- Explain the pedagogical concept, theoretical basis (e.g., Piaget, Vygotsky, NCF 2005 if applicable), or step-by-step mathematical logic clearly.
- Keep it concise (3-5 sentences).
- Do NOT use markdown code blocks or json. Return direct text.
`;

    return this.callGeminiApi(prompt).pipe(
      map(rawText => this.cleanPlainTextResponse(rawText))
    );
  }

  /**
   * Generate an in-depth AI performance diagnostic and personalized improvement roadmap.
   */
  public generatePerformanceSummary(attempt: QuizAttempt, language: string = 'Bengali'): Observable<string> {
    const isEn = language.toLowerCase() === 'english';
    
    // Extract missed/wrong questions
    const missedQuestions = attempt.questions.filter((q: QuizQuestion) => attempt.userAnswers[q.id] !== q.correctAnswer);
    const missedSummary = missedQuestions.map((q: QuizQuestion, idx: number) => {
      const userAnsIdx = attempt.userAnswers[q.id];
      const userAnsText = userAnsIdx !== undefined ? q.options[userAnsIdx] : 'Skipped';
      const correctAnsText = q.options[q.correctAnswer];
      return `${idx + 1}. [${q.subject}] ${q.question} -> Student gave: "${userAnsText}" | Correct: "${correctAnsText}"`;
    }).slice(0, 8).join('\n');

    const prompt = `
You are a top mentor and expert evaluator for West Bengal Primary Teacher Eligibility Test (WB Primary TET).

Analyze the student's exam performance:
- Test: ${attempt.quizTitle} (${attempt.mode === 'mock' ? 'Timed Mock Test' : 'Practice Mode'})
- Score: ${attempt.score} out of ${attempt.totalQuestions} (${attempt.accuracy}% accuracy)
- Correct: ${attempt.correctAnswers}, Incorrect: ${attempt.incorrectAnswers}, Skipped: ${attempt.skippedAnswers}
- Time Taken: ${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s

Missed Questions / Gaps:
${missedSummary || 'None - scored 100%'}

Task:
Write an insightful, motivating, and highly practical diagnostic summary and improvement roadmap for this student in ${isEn ? 'English' : 'Bengali (বাংলা)'}.

Include:
1. 🌟 সার্বিক মূল্যায়ন ও প্রশংসা (Overall evaluation & strengths observed)
2. ⚠️ যে যে বিষয় ও ধারণায় আরও উন্নতি প্রয়োজন (Specific conceptual gaps identified from missed questions)
3. 📚 আগামী পরীক্ষার জন্য বাস্তব পরামর্শ ও রণনীতি (Concrete study strategy & pedagogical tips)
4. 🎯 পরবর্তী পদক্ষেপ (Clear recommendation on which subject to practice next)

Keep it warm, encouraging, easy to understand, and well-structured with clear bullet points. Return clean text with no JSON or code fences.
`;

    return this.callGeminiApi(prompt).pipe(
      map(rawText => this.cleanPlainTextResponse(rawText))
    );
  }

  /**
   * Generate a 10-Question Targeted Practice Quiz similar to a given base question.
   */
  public generateSimilarQuiz(
    baseQuestion: QuizQuestion,
    numberOfQuestions: number = 10,
    language: string = 'Bengali'
  ): Observable<QuizResponse> {
    const isEn = language.toLowerCase() === 'english';
    const prompt = `
You are an expert Primary Teacher Eligibility Test (TET) question paper creator.

The student needs focused practice on the specific pedagogical concept, mathematical logic, or grammatical rule tested in this question:

Subject: ${baseQuestion.subject}
Original Question: ${baseQuestion.question}
Correct Answer: ${baseQuestion.options[baseQuestion.correctAnswer]}
${baseQuestion.explanation ? `Concept Background: ${baseQuestion.explanation}` : ''}

Task:
Generate exactly ${numberOfQuestions} diverse, high-quality multiple-choice questions for WB Primary TET that test the SAME core topic, concept, pedagogy, or skill.

Requirements:
1. Language: ${isEn ? 'English' : 'Bengali (বাংলা)'}.
2. Each question must have exactly 4 non-empty options.
3. Only 1 option must be correct.
4. "correctAnswer" must be a 0-indexed integer (0, 1, 2, or 3).
5. Provide a clear, step-by-step educational explanation for each question in ${isEn ? 'English' : 'Bengali (বাংলা)'}.
6. Vary the scenarios, numbers, pedagogical context, or sentences while testing the same underlying concept.
7. Return ONLY valid JSON format with NO markdown fences.

Required JSON Structure:
{
  "quizTitle": "${baseQuestion.subject} - 10 Similar Concept Questions",
  "language": "${isEn ? 'English' : 'Bengali'}",
  "questions": [
    {
      "id": 1,
      "subject": "${baseQuestion.subject}",
      "question": "Question text...",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation...",
      "difficulty": "${baseQuestion.difficulty || 'Medium'}"
    }
  ]
}
`;

    return this.callGeminiApi(prompt).pipe(
      map(rawResponse => this.parseAndValidateQuizResponse(rawResponse, `${baseQuestion.subject} - Similar Questions Quiz`, language))
    );
  }

  /**
   * Generate a similar practice question testing the same concept.
   */
  public generateSimilarQuestion(baseQuestion: QuizQuestion, language: string = 'Bengali'): Observable<QuizQuestion> {
    const isEn = language.toLowerCase() === 'english';
    const prompt = `
You are an expert Primary TET question paper creator.
The student struggled with the following question:
Subject: ${baseQuestion.subject}
Question: ${baseQuestion.question}
Correct Answer: ${baseQuestion.options[baseQuestion.correctAnswer]}

Generate 1 NEW, similar multiple-choice question testing the exact same conceptual skill or pedagogical theory for Primary TET preparation in ${isEn ? 'English' : 'Bengali'}.

Requirements:
1. Language: ${isEn ? 'English' : 'Bengali'}.
2. Exactly four options.
3. Exactly one correct answer.
4. correctAnswer must be 0-indexed integer (0 for 1st, 1 for 2nd, 2 for 3rd, 3 for 4th).
5. Include a short explanation in ${isEn ? 'English' : 'Bengali'}.
6. Return ONLY valid JSON format with NO markdown fences:
{
  "id": 1,
  "subject": "${baseQuestion.subject}",
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "correctAnswer": 0,
  "explanation": "...",
  "difficulty": "${baseQuestion.difficulty}"
}
`;

    return this.callGeminiApi(prompt).pipe(
      map(rawText => {
        const cleaned = this.extractCleanJson(rawText);
        const parsed = JSON.parse(cleaned);
        return this.validateSingleQuestion(parsed, 1, baseQuestion.subject);
      })
    );
  }

  /**
   * Generate comprehensive, memorable Pedagogical Topic Study Notes with Gemini AI.
   * Teaches the core concept, key rules/theories, real-life classroom examples,
   * memory mnemonics/shortcuts, common exam mistakes to avoid, and revision takeaways.
   */
  public generateTopicStudyNotes(
    baseQuestion: QuizQuestion,
    language: string = 'Bengali'
  ): Observable<TopicNote> {
    const isEn = language.toLowerCase() === 'english';
    const prompt = `
You are an expert Primary Teacher Eligibility Test (WB Primary TET) Master Mentor, child pedagogy researcher, and curriculum specialist.

A student struggled with or wants to master the core topic behind this question:
Subject: ${baseQuestion.subject}
Question: ${baseQuestion.question}
Correct Answer: ${baseQuestion.options[baseQuestion.correctAnswer]}
${baseQuestion.explanation ? `Context / Explanation: ${baseQuestion.explanation}` : ''}

Your Task:
Teach this exact topic comprehensively so the student understands the underlying concepts deeply, can never forget it, and scores full marks in TET exams.

Generate structured study notes in ${isEn ? 'English' : 'Bengali (বাংলা)'} strictly conforming to this JSON format:
{
  "topicTitle": "${isEn ? 'Specific Topic Title (e.g. Jean Piaget Cognitive Development Stages)' : 'স্পষ্ট টপিক শিরোনাম (যেমন: পিঁয়াজের প্রজ্ঞামূলক বিকাশ তত্ত্ব বা ভগ্নাংশের ল.সা.গু)'}",
  "subject": "${baseQuestion.subject}",
  "coreConcept": "A crystal-clear, lucid explanation of the concept, what it is, its purpose, and foundational meaning in ${isEn ? 'English' : 'Bengali'}.",
  "keyPoints": [
    "Key theoretical rule, stage, formula, or pedagogical principle 1",
    "Key theoretical rule, stage, formula, or pedagogical principle 2",
    "Key theoretical rule, stage, formula, or pedagogical principle 3",
    "Key theoretical rule, stage, formula, or pedagogical principle 4"
  ],
  "realLifeExample": "A practical, memorable real-life classroom teaching scenario, solved mathematical example, or everyday application illustrating this concept.",
  "memoryMnemonics": "An ingenious, catchy memory trick, acronym, rhyme, or mental hook to help the student remember this forever without getting confused.",
  "commonMistakes": [
    "Common misconception or trap that students frequently fall into in TET exams",
    "How to distinguish between confusing related terms or options"
  ],
  "examTakeaways": [
    "High-yield revision point 1 for fast last-minute review",
    "High-yield revision point 2",
    "High-yield revision point 3"
  ],
  "tags": ["TET", "${baseQuestion.subject}"]
}

Requirements:
1. Language must be ${isEn ? 'English' : 'Bengali (বাংলা)'}.
2. Ensure high pedagogical depth, authentic TET standards, and crystal-clear clarity.
3. Return ONLY valid JSON format with NO markdown code blocks, no backticks.
`;

    return this.callGeminiApi(prompt).pipe(
      map(rawText => this.parseAndValidateTopicNote(rawText, baseQuestion, language))
    );
  }

  /**
   * Generate 10 Targeted Practice Questions directly from a Saved Topic Note.
   */
  public generateQuizFromTopicNote(
    topicNote: TopicNote,
    numberOfQuestions: number = 10,
    language: string = 'Bengali'
  ): Observable<QuizResponse> {
    const isEn = language.toLowerCase() === 'english';
    const prompt = `
You are an expert Primary TET question paper creator.

Generate a focused, high-yield practice quiz for WB Primary TET candidates on this topic:
Topic: ${topicNote.topicTitle}
Subject: ${topicNote.subject}
Core Concept: ${topicNote.coreConcept}
Key Points: ${topicNote.keyPoints?.join('; ') || ''}

Task:
Generate exactly ${numberOfQuestions} diverse, high-quality multiple-choice questions testing various aspects, applications, and scenarios of this topic.

Requirements:
1. Language: ${isEn ? 'English' : 'Bengali (বাংলা)'}.
2. Exactly 4 options per question.
3. Exactly 1 correct answer (correctAnswer must be a 0-indexed integer 0, 1, 2, or 3).
4. Detailed, step-by-step educational explanations in ${isEn ? 'English' : 'Bengali'}.
5. Return ONLY valid JSON format:
{
  "quizTitle": "${topicNote.topicTitle} - Practice Quiz",
  "language": "${isEn ? 'English' : 'Bengali'}",
  "questions": [
    {
      "id": 1,
      "subject": "${topicNote.subject}",
      "question": "Question text...",
      "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"],
      "correctAnswer": 0,
      "explanation": "Explanation...",
      "difficulty": "Medium"
    }
  ]
}
`;

    return this.callGeminiApi(prompt).pipe(
      map(rawResponse => this.parseAndValidateQuizResponse(rawResponse, `${topicNote.topicTitle} - Practice Quiz`, language))
    );
  }

  /**
   * Candidate models ordered by reliability, speed, and availability
   */
  private readonly candidateModels: string[] = [
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview',
    'gemma-4-26b-a4b-it',
    'gemini-flash-latest'
  ];

  /**
   * Get ordered list of candidate models with the environment-configured model prioritized
   */
  public getCandidateModels(): string[] {
    const configured = this.getModelName();
    return Array.from(new Set([configured, ...this.candidateModels]));
  }

  /**
   * Direct HTTP Call to Gemini GenerateContent with automatic multi-model waterfall fallback.
   * If a model returns 503 (high demand), 429 (rate limit), 404, or 500, it instantly tries the next candidate.
   */
  private callGeminiApi(prompt: string): Observable<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return throwError(() => new Error('API Key is missing in environment.ts'));
    }

    const models = this.getCandidateModels();
    return this.tryModelSequence(prompt, apiKey, models, 0, []);
  }

  /**
   * Recursive waterfall model executor
   */
  private tryModelSequence(
    prompt: string,
    apiKey: string,
    models: string[],
    index: number,
    accumulatedErrors: string[]
  ): Observable<string> {
    if (index >= models.length) {
      const summary = accumulatedErrors.join(' \n• ');
      return throwError(() => new Error(`All Gemini candidate models failed:\n• ${summary}`));
    }

    const currentModel = models[index];
    const url = `${environment.geminiApiUrl}/${currentModel}:generateContent?key=${apiKey}`;

    const isJson = prompt.toLowerCase().includes('json') || prompt.includes('{');

    const generationConfig: any = {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192
    };

    if (isJson) {
      generationConfig.responseMimeType = 'application/json';
    }

    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: generationConfig
    };

    return this.http.post<any>(url, body).pipe(
      map(response => {
        if (
          response &&
          response.candidates &&
          response.candidates.length > 0 &&
          response.candidates[0].content &&
          response.candidates[0].content.parts &&
          response.candidates[0].content.parts.length > 0
        ) {
          return response.candidates[0].content.parts[0].text;
        }
        throw new Error('Empty response received from Gemini API');
      }),
      catchError((error: HttpErrorResponse | Error) => {
        let errDetail = 'Unknown Error';
        if (error instanceof HttpErrorResponse) {
          if (error.error?.error?.message) {
            errDetail = `[HTTP ${error.status}] ${error.error.error.message}`;
          } else if (error.message) {
            errDetail = `[HTTP ${error.status}] ${error.message}`;
          }
        } else if (error?.message) {
          errDetail = error.message;
        }

        console.warn(`[GeminiService] Model '${currentModel}' failed: ${errDetail}. Cascading to next candidate...`);
        const updatedErrors = [...accumulatedErrors, `${currentModel}: ${errDetail}`];

        return this.tryModelSequence(prompt, apiKey, models, index + 1, updatedErrors);
      })
    );
  }

  /**
   * Prompt Builder for Subject-wise Quiz
   */
  private buildSubjectQuizPrompt(
    subject: string,
    numberOfQuestions: number,
    difficulty: string,
    language: string
  ): string {
    const isEn = language.toLowerCase() === 'english';
    return `
You are an expert Primary TET question paper creator.

Generate multiple-choice questions for Primary TET preparation.

Quiz Type: Subject-wise
Subject: ${subject}
Number of Questions: ${numberOfQuestions}
Difficulty: ${difficulty}
Language: ${isEn ? 'English' : 'Bengali (বাংলা)'}

Requirements:
1. Questions must strictly align with the Primary TET curriculum (Classes 1 to 5 teacher eligibility level).
2. Language must be ${isEn ? 'English' : 'Bengali'}.
3. Each question must have exactly four options.
4. Only one option must be correct.
5. Include the correct answer as a 0-indexed integer (0 for first option, 1 for second, 2 for third, 3 for fourth).
6. Include a short, educational explanation in ${isEn ? 'English' : 'Bengali (বাংলা)'}.
7. Avoid duplicate questions.
8. Questions should test pedagogical understanding and conceptual clarity.
9. Return ONLY valid JSON.
10. Do not include Markdown or backticks.

Required JSON Structure:
{
  "quizTitle": "Primary TET ${subject} Quiz",
  "language": "${isEn ? 'English' : 'Bengali'}",
  "questions": [
    {
      "id": 1,
      "subject": "${subject}",
      "question": "Question text...",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correctAnswer": 0,
      "explanation": "Explanation text...",
      "difficulty": "${difficulty === 'Mixed' ? 'Medium' : difficulty}"
    }
  ]
}
`;
  }

  /**
   * Prompt Builder for Mixed Quiz (5 Primary TET Subjects)
   */
  private buildMixedQuizPrompt(
    numberOfQuestions: number,
    difficulty: string,
    language: string
  ): string {
    const isEn = language.toLowerCase() === 'english';
    return `
You are an expert Primary TET question paper creator.

Generate multiple-choice questions for Primary TET Mixed Mock Test.

Quiz Type: Mixed Quiz
Subjects to evenly distribute among:
- Bengali
- Mathematics
- Child Development & Pedagogy
- Environmental Studies
- English

Number of Questions: ${numberOfQuestions}
Difficulty: ${difficulty}
Language: ${isEn ? 'English' : 'Bengali (বাংলা)'}

Requirements:
1. Questions must strictly align with Primary TET syllabus standard.
2. Evenly distribute questions across the 5 subjects.
3. Language of questions and options: ${isEn ? 'English' : 'Bengali'}.
4. Each question must have exactly four options.
5. Only one option must be correct.
6. "correctAnswer" must be a 0-indexed integer (0, 1, 2, or 3).
7. Include a short explanation in ${isEn ? 'English' : 'Bengali'}.
8. Avoid duplicate questions.
9. Return ONLY valid JSON. Do not include Markdown or backticks.

Required JSON Structure:
{
  "quizTitle": "Primary TET Mixed Mock Test",
  "language": "${isEn ? 'English' : 'Bengali'}",
  "questions": [
    {
      "id": 1,
      "subject": "Child Development & Pedagogy",
      "question": "Question text...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation text...",
      "difficulty": "Medium"
    }
  ]
}
`;
  }

  /**
   * Prompt Builder for Previous Year Questions (PYQ)
   */
  private buildPyqPrompt(
    year: number | string,
    subject: string,
    numberOfQuestions: number,
    language: string,
    topic?: string
  ): string {
    const isEn = language.toLowerCase() === 'english';
    const numYear = Number(year) || 2023;
    const subjectScope = subject === 'all'
      ? 'across all 5 core subjects (Child Development & Pedagogy, Bengali, English, Mathematics, Environmental Studies)'
      : `specifically for the subject '${subject}'`;
    const topicScope = topic && topic !== 'all' ? `focusing on the topic/concept '${topic}'` : '';

    return `
You are an expert on West Bengal Primary Teacher Eligibility Test (WB Primary TET) official question papers and syllabus.

Generate exactly ${numberOfQuestions} authentic or official-pattern multiple-choice questions from the West Bengal Primary TET ${year} Examination (${subjectScope} ${topicScope}).

Year: ${year} WB Primary TET
Exam Name: WB Primary TET ${year}
Subject Scope: ${subject === 'all' ? 'All 5 Subjects balanced' : subject}
${topic && topic !== 'all' ? `Topic Focus: ${topic}` : ''}
Number of Questions: ${numberOfQuestions}
Language: ${isEn ? 'English' : 'Bengali (বাংলা)'}

Requirements:
1. Questions must reflect the authentic questions, style, syllabus, and pedagogical depth of the WB Primary TET ${year} exam conducted by WBBPE (West Bengal Board of Primary Education).
2. For ${isEn ? 'English' : 'Bengali'}, ensure natural, accurate Bengali terminology commonly used in WB TET (e.g., বিকাশ, পেডাগজি, ব্যুৎপত্তি, ব্যাকরণ, মূল্যায়ন, ধারণা গঠন, অন্তর্ভুক্তিমূলক শিক্ষা).
3. Include specific, realistic topic names for each question (e.g., "বিকাশের নীতি ও স্তর", "পেডাগজি ও শিখন", "ব্যাকরণ ও ভাষাতত্ত্ব", "বাস্তুতন্ত্র ও শক্তিপ্রবাহ", "ভগ্নাংশ ও জ্যামিতি", "Grammar & Comprehension").
4. Each question must have exactly four non-empty options.
5. Exactly one option is correct.
6. "correctAnswer" must be a 0-indexed integer (0, 1, 2, or 3).
7. Provide a detailed, step-by-step pedagogical explanation in ${isEn ? 'English' : 'Bengali (বাংলা)'} explaining why the answer is correct according to Primary TET standard and pedagogy.
8. Return ONLY valid JSON with no markdown formatting.

Required JSON Structure:
{
  "quizTitle": "WB Primary TET ${year} Official Question Paper",
  "language": "${isEn ? 'English' : 'Bengali'}",
  "questions": [
    {
      "id": "pyq-${numYear}-1",
      "year": ${numYear},
      "examName": "WB Primary TET ${year}",
      "subject": "Child Development & Pedagogy",
      "topic": "বিকাশের নীতি ও ধারণা",
      "question": "Question text...",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Detailed pedagogical explanation...",
      "difficulty": "Medium"
    }
  ]
}
`;
  }

  /**
   * Parses and validates raw Gemini response into strongly-typed PreviousYearQuestion[]
   */
  private parseAndValidatePyqResponse(
    rawText: string,
    defaultYear: number,
    defaultSubject: string,
    defaultLanguage: string
  ): PreviousYearQuestion[] {
    const cleaned = this.extractCleanJson(rawText);
    let parsed: any = null;

    try {
      parsed = JSON.parse(cleaned);
    } catch (e1) {
      console.warn('[GeminiService] Direct PYQ JSON.parse failed. Attempting syntax repair...', (e1 as Error).message);
      try {
        const repaired = cleaned
          .replace(/,\s*([\}\]])/g, '$1')
          .replace(/\n\s*"[^":\n\r]+"\s*,\s*(?=\n\s*")/g, '\n')
          .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
        parsed = JSON.parse(repaired);
      } catch (e2) {
        console.warn('[GeminiService] Secondary PYQ repair failed. Using regex fallback...');
      }
    }

    let rawQuestions: any[] = [];
    if (parsed) {
      if (Array.isArray(parsed)) {
        rawQuestions = parsed;
      } else if (Array.isArray(parsed.questions)) {
        rawQuestions = parsed.questions;
      }
    }

    const validatedList: PreviousYearQuestion[] = [];
    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];
      try {
        const validated = this.validateSinglePyqQuestion(q, i + 1, defaultYear, defaultSubject);
        validatedList.push(validated);
      } catch (err) {
        console.warn(`Skipping invalid PYQ question at index ${i}:`, err);
      }
    }

    if (validatedList.length > 0) {
      return validatedList;
    }

    // Fallback: extract questions via regex
    const regexQuestions = this.extractQuestionsWithRegex(rawText, defaultSubject);
    if (regexQuestions.length > 0) {
      return regexQuestions.map((q, idx) => ({
        id: `gemini-pyq-${defaultYear}-${idx + 1}-${Date.now() % 10000}`,
        year: defaultYear,
        examName: `WB Primary TET ${defaultYear}`,
        subject: q.subject || defaultSubject,
        topic: `${q.subject || defaultSubject} Concepts`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty
      }));
    }

    throw new Error('No valid previous year questions could be extracted from Gemini response');
  }

  private validateSinglePyqQuestion(
    raw: any,
    fallbackIndex: number,
    defaultYear: number,
    defaultSubject: string
  ): PreviousYearQuestion {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Question must be an object');
    }

    if (!raw.question || typeof raw.question !== 'string' || raw.question.trim().length === 0) {
      throw new Error('Question text is missing');
    }

    if (!Array.isArray(raw.options) || raw.options.length !== 4) {
      throw new Error('Question must have exactly 4 options');
    }

    const options = raw.options.map((opt: any) => String(opt || '').trim());
    if (options.some((opt: string) => opt.length === 0)) {
      throw new Error('All 4 options must be non-empty');
    }

    let correctAnswer = Number(raw.correctAnswer);
    if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
      if (correctAnswer >= 1 && correctAnswer <= 4) {
        correctAnswer = correctAnswer - 1;
      } else {
        correctAnswer = 0;
      }
    }

    const year = Number(raw.year) || defaultYear || 2023;
    const sub = (raw.subject && String(raw.subject).trim().length > 0)
      ? String(raw.subject).trim()
      : (defaultSubject !== 'all' ? defaultSubject : 'General');
    const examName = raw.examName && String(raw.examName).trim().length > 0
      ? String(raw.examName).trim()
      : `WB Primary TET ${year}`;
    const topic = raw.topic && String(raw.topic).trim().length > 0
      ? String(raw.topic).trim()
      : `${sub} Pedagogy & Concepts`;

    return {
      id: raw.id ? `gemini-pyq-${raw.id}` : `gemini-pyq-${year}-${sub.substring(0, 3).toLowerCase()}-${fallbackIndex}-${Date.now() % 10000}`,
      year: year,
      examName: examName,
      subject: sub,
      topic: topic,
      question: raw.question.trim(),
      options: options,
      correctAnswer: correctAnswer,
      explanation: raw.explanation ? String(raw.explanation).trim() : 'Detailed pedagogical explanation is unavailable.',
      difficulty: raw.difficulty || 'Medium'
    };
  }

  /**
   * Strips markdown fences, parses JSON, and validates complete schema with auto-repair fallbacks
   */
  private parseAndValidateQuizResponse(
    rawText: string,
    defaultTitle: string,
    defaultLanguage: string
  ): QuizResponse {
    const cleaned = this.extractCleanJson(rawText);
    let parsed: any = null;

    // 1. Direct JSON parse attempt
    try {
      parsed = JSON.parse(cleaned);
    } catch (e1) {
      console.warn('[GeminiService] Initial Quiz JSON.parse failed. Attempting syntax repair...', (e1 as Error).message);
      
      // 2. Secondary repair: fix orphaned lines and trailing commas
      try {
        const repaired = cleaned
          .replace(/,\s*([\}\]])/g, '$1')
          .replace(/\n\s*"[^":\n\r]+"\s*,\s*(?=\n\s*")/g, '\n')
          .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
        parsed = JSON.parse(repaired);
      } catch (e2) {
        console.warn('[GeminiService] Secondary repair failed. Extracting questions via regex engine...');
      }
    }

    // 3. If parsed successfully as object or array
    if (parsed) {
      let rawQuestions: any[] = [];
      if (Array.isArray(parsed)) {
        rawQuestions = parsed;
      } else if (Array.isArray(parsed.questions)) {
        rawQuestions = parsed.questions;
      }

      const validatedQuestions: QuizQuestion[] = [];
      for (let i = 0; i < rawQuestions.length; i++) {
        const q = rawQuestions[i];
        try {
          const validated = this.validateSingleQuestion(q, i + 1);
          validatedQuestions.push(validated);
        } catch (err) {
          console.warn(`Skipping question ${i}:`, err);
        }
      }

      if (validatedQuestions.length > 0) {
        return {
          quizTitle: parsed.quizTitle || defaultTitle,
          language: parsed.language || defaultLanguage,
          questions: validatedQuestions
        };
      }
    }

    // 4. Robust Regex Fallback Extractor (guarantees quiz never fails even if syntax is malformed)
    const regexQuestions = this.extractQuestionsWithRegex(rawText, 'General');
    if (regexQuestions.length > 0) {
      return {
        quizTitle: defaultTitle,
        language: defaultLanguage,
        questions: regexQuestions
      };
    }

    throw new Error('No valid questions could be extracted from Gemini response');
  }

  private extractQuestionsWithRegex(rawText: string, defaultSubject: string): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const questionBlocks = rawText.split(/"id"\s*:\s*\d+/i);
    
    for (let i = 1; i < questionBlocks.length; i++) {
      const block = questionBlocks[i];
      const qMatch = block.match(/"question"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
      const questionText = qMatch ? qMatch[1].replace(/\\"/g, '"') : '';
      
      const optMatch = block.match(/"options"\s*:\s*\[([\s\S]*?)\]/i);
      let options: string[] = [];
      if (optMatch) {
        options = optMatch[1]
          .split(/,\s*\n|",\s*"/)
          .map(s => s.replace(/^[\["\s]+|[\]"\s,]+$/g, '').trim())
          .filter(s => s.length > 0);
      }
      
      if (options.length < 4) {
        options = ['ক', 'খ', 'গ', 'ঘ'];
      } else if (options.length > 4) {
        options = options.slice(0, 4);
      }
      
      const ansMatch = block.match(/"correctAnswer"\s*:\s*(\d+)/i);
      let correctAnswer = ansMatch ? parseInt(ansMatch[1], 10) : 0;
      if (correctAnswer < 0 || correctAnswer > 3) correctAnswer = 0;
      
      const expMatch = block.match(/"explanation"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
      const explanation = expMatch ? expMatch[1].replace(/\\"/g, '"') : 'Educational explanation.';
      
      const subMatch = block.match(/"subject"\s*:\s*"([^"]+)"/i);
      const subject = subMatch ? subMatch[1] : defaultSubject;
      
      if (questionText.length > 0) {
        questions.push({
          id: i,
          subject: subject,
          question: questionText,
          options: options,
          correctAnswer: correctAnswer,
          explanation: explanation,
          difficulty: 'Medium'
        });
      }
    }
    
    return questions;
  }

  private validateSingleQuestion(
    raw: any,
    fallbackId: number,
    defaultSubject: string = 'General'
  ): QuizQuestion {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Question must be an object');
    }

    if (!raw.question || typeof raw.question !== 'string' || raw.question.trim().length === 0) {
      throw new Error('Question text is missing');
    }

    if (!Array.isArray(raw.options) || raw.options.length !== 4) {
      throw new Error('Question must have exactly 4 options');
    }

    const options = raw.options.map((opt: any) => String(opt || '').trim());
    if (options.some((opt: string) => opt.length === 0)) {
      throw new Error('All 4 options must be non-empty');
    }

    let correctAnswer = Number(raw.correctAnswer);
    if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
      if (correctAnswer >= 1 && correctAnswer <= 4) {
        correctAnswer = correctAnswer - 1;
      } else {
        correctAnswer = 0;
      }
    }

    return {
      id: raw.id || fallbackId,
      subject: raw.subject || defaultSubject,
      question: raw.question.trim(),
      options: options,
      correctAnswer: correctAnswer,
      explanation: raw.explanation ? String(raw.explanation).trim() : 'Explanation is unavailable.',
      difficulty: raw.difficulty || 'Medium'
    };
  }

  private extractCleanJson(text: string): string {
    if (!text) return '{}';
    let cleaned = text.trim();

    // 1. Remove markdown code fences
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // 2. Remove thoughts
    cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

    // 3. Find outermost bounds
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIdx = -1;

    if (firstBrace !== -1 && firstBracket !== -1) {
      startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
    }

    if (startIdx !== -1) {
      cleaned = cleaned.substring(startIdx);
      const isObj = cleaned.startsWith('{');
      const closeChar = isObj ? '}' : ']';
      const lastClose = cleaned.lastIndexOf(closeChar);
      if (lastClose !== -1) {
        cleaned = cleaned.substring(0, lastClose + 1);
      }
    }

    // 4. Auto-repair dangling orphaned lines without colons (e.g. `"শ: অপশন নিচে",`)
    cleaned = cleaned.replace(/\n\s*"[^":\n\r]+"\s*,\s*(?=\n\s*")/g, '\n');

    // 5. Auto-repair trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');

    return cleaned.trim();
  }

  private cleanPlainTextResponse(text: string): string {
    if (!text) return '';
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  private parseAndValidateTopicNote(
    rawText: string,
    baseQuestion: QuizQuestion,
    defaultLanguage: string
  ): TopicNote {
    const isEn = defaultLanguage.toLowerCase() === 'english';
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleaned = this.extractCleanJson(rawText);

    let parsed: any = null;

    try {
      parsed = JSON.parse(cleaned);
    } catch (e1) {
      console.warn('[GeminiService] Direct parse failed for Topic Note. Attempting fallback parse...', (e1 as Error).message);
      
      try {
        const secondaryCleaned = cleaned
          .replace(/,\s*([\}\]])/g, '$1')
          .replace(/\n\s*"[^":\n\r]+"\s*,\s*(?=\n\s*")/g, '\n')
          .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
        parsed = JSON.parse(secondaryCleaned);
      } catch (e2) {
        console.warn('[GeminiService] Secondary parse failed. Using regex field extractor...');
      }
    }

    // If still not parsed, use regex field extraction directly from rawText
    if (!parsed || typeof parsed !== 'object') {
      parsed = this.extractTopicNoteFieldsWithRegex(rawText, baseQuestion, isEn);
    }

    return {
      id: noteId,
      topicTitle: parsed.topicTitle || `${baseQuestion.subject} - Concept Note`,
      subject: parsed.subject || baseQuestion.subject,
      sourceQuestion: baseQuestion.question,
      sourceExplanation: baseQuestion.explanation,
      coreConcept: parsed.coreConcept || (baseQuestion.explanation || (isEn ? 'Core conceptual overview is provided below.' : 'মূল ধারণার বিশদ বিবরণ নিচে দেওয়া হলো।')),
      keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0 
        ? parsed.keyPoints.map((k: any) => String(k).trim()) 
        : [parsed.coreConcept || (isEn ? 'Key pedagogical guidelines.' : 'গুরুত্বপূর্ণ নিয়ম ও নির্দেশনাবলি।')],
      realLifeExample: parsed.realLifeExample ? String(parsed.realLifeExample).trim() : '',
      memoryMnemonics: parsed.memoryMnemonics ? String(parsed.memoryMnemonics).trim() : '',
      commonMistakes: Array.isArray(parsed.commonMistakes) 
        ? parsed.commonMistakes.map((m: any) => String(m).trim()) 
        : [],
      examTakeaways: Array.isArray(parsed.examTakeaways) && parsed.examTakeaways.length > 0 
        ? parsed.examTakeaways.map((t: any) => String(t).trim()) 
        : [parsed.coreConcept || ''],
      savedAt: new Date().toISOString(),
      language: isEn ? 'English' : 'Bengali',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['TET', baseQuestion.subject]
    };
  }

  private extractTopicNoteFieldsWithRegex(rawText: string, baseQuestion: QuizQuestion, isEn: boolean): any {
    const extractString = (field: string): string => {
      const match = rawText.match(new RegExp(`"${field}"\\s*:\\s*"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"`, 'i'));
      return match ? match[1].replace(/\\"/g, '"') : '';
    };

    const extractArray = (field: string): string[] => {
      const match = rawText.match(new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]+)\\]`, 'i'));
      if (!match) return [];
      const items = match[1].split(/",\s*"/).map(s => s.replace(/^["\s]+|["\s]+$/g, '').trim());
      return items.filter(s => s.length > 0);
    };

    return {
      topicTitle: extractString('topicTitle') || `${baseQuestion.subject} - ${baseQuestion.question.slice(0, 35)}...`,
      subject: extractString('subject') || baseQuestion.subject,
      coreConcept: extractString('coreConcept') || (baseQuestion.explanation || (isEn ? 'Core pedagogical overview.' : 'মৌলিক ধারণা ও ব্যাখ্যা।')),
      keyPoints: extractArray('keyPoints'),
      realLifeExample: extractString('realLifeExample'),
      memoryMnemonics: extractString('memoryMnemonics'),
      commonMistakes: extractArray('commonMistakes'),
      examTakeaways: extractArray('examTakeaways')
    };
  }
}


