import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { QuizQuestion, QuizResponse, QuizAttempt, TET_SUBJECTS } from '../shared/models/quiz.model';

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
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192
      }
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
    language: string
  ): string {
    const isEn = language.toLowerCase() === 'english';
    const subjectScope = subject === 'all'
      ? 'across all 5 core subjects (Child Development & Pedagogy, Bengali, English, Mathematics, Environmental Studies)'
      : `specifically for the subject '${subject}'`;

    return `
You are an expert on West Bengal Primary Teacher Eligibility Test (WB Primary TET) official question papers and syllabus.

Generate ${numberOfQuestions} authentic or official-pattern multiple-choice questions from the West Bengal Primary TET ${year} Examination (${subjectScope}).

Year: ${year} WB Primary TET
Subject Scope: ${subject === 'all' ? 'All 5 Subjects balanced' : subject}
Number of Questions: ${numberOfQuestions}
Language: ${isEn ? 'English' : 'Bengali (বাংলা)'}

Requirements:
1. Questions must reflect the authentic questions, style, syllabus, and pedagogical depth of the WB Primary TET ${year} exam conducted by WBBPE (West Bengal Board of Primary Education).
2. For ${isEn ? 'English' : 'Bengali'}, ensure natural, accurate Bengali terminology commonly used in WB TET (e.g., বিকাশ, পেডাগজি, ব্যুৎপত্তি, ব্যাকরণ, মূল্যায়ন, ধারণা গঠন).
3. Each question must have exactly four options.
4. Exactly one option is correct.
5. "correctAnswer" must be a 0-indexed integer (0, 1, 2, or 3).
6. Provide a detailed, step-by-step pedagogical explanation in ${isEn ? 'English' : 'Bengali (বাংলা)'} explaining why the answer is correct according to Primary TET standard and pedagogy.
7. Return ONLY valid JSON with no markdown formatting.

Required JSON Structure:
{
  "quizTitle": "WB Primary TET ${year} Official Question Paper",
  "language": "${isEn ? 'English' : 'Bengali'}",
  "questions": [
    {
      "id": 1,
      "subject": "Child Development & Pedagogy",
      "question": "Question text...",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation...",
      "difficulty": "Medium"
    }
  ]
}
`;
  }

  /**
   * Strips markdown fences, parses JSON, and validates complete schema
   */
  private parseAndValidateQuizResponse(
    rawText: string,
    defaultTitle: string,
    defaultLanguage: string
  ): QuizResponse {
    const cleaned = this.extractCleanJson(rawText);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error(`JSON_PARSE_ERROR: Failed to parse Gemini response as JSON: ${(e as Error).message}`);
    }

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      if (Array.isArray(parsed)) {
        parsed = {
          quizTitle: defaultTitle,
          language: defaultLanguage,
          questions: parsed
        };
      } else {
        throw new Error('Invalid quiz response structure: questions array missing');
      }
    }

    const validatedQuestions: QuizQuestion[] = [];
    for (let i = 0; i < parsed.questions.length; i++) {
      const q = parsed.questions[i];
      try {
        const validated = this.validateSingleQuestion(q, i + 1);
        validatedQuestions.push(validated);
      } catch (err) {
        console.warn(`Skipping question ${i}:`, err);
      }
    }

    if (validatedQuestions.length === 0) {
      throw new Error('No valid questions could be extracted from Gemini response');
    }

    return {
      quizTitle: parsed.quizTitle || defaultTitle,
      language: parsed.language || defaultLanguage,
      questions: validatedQuestions
    };
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

    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }

    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }

    cleaned = cleaned.trim();

    const firstOpenBrace = cleaned.indexOf('{');
    const firstOpenBracket = cleaned.indexOf('[');
    let startIdx = -1;

    if (firstOpenBrace !== -1 && firstOpenBracket !== -1) {
      startIdx = Math.min(firstOpenBrace, firstOpenBracket);
    } else if (firstOpenBrace !== -1) {
      startIdx = firstOpenBrace;
    } else if (firstOpenBracket !== -1) {
      startIdx = firstOpenBracket;
    }

    const lastCloseBrace = cleaned.lastIndexOf('}');
    const lastCloseBracket = cleaned.lastIndexOf(']');
    const endIdx = Math.max(lastCloseBrace, lastCloseBracket);

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }

    return cleaned;
  }

  private cleanPlainTextResponse(text: string): string {
    if (!text) return '';
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  }
}
