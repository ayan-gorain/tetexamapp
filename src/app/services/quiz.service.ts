import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { QuizConfig, QuizQuestion, QuizAttempt, QuizResponse } from '../shared/models/quiz.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private activeConfigSubject = new BehaviorSubject<QuizConfig | null>(null);
  public activeConfig$ = this.activeConfigSubject.asObservable();

  private activeQuestionsSubject = new BehaviorSubject<QuizQuestion[]>([]);
  public activeQuestions$ = this.activeQuestionsSubject.asObservable();

  private currentQuestionIndexSubject = new BehaviorSubject<number>(0);
  public currentQuestionIndex$ = this.currentQuestionIndexSubject.asObservable();

  private userAnswersSubject = new BehaviorSubject<{ [questionId: number]: number }>({});
  public userAnswers$ = this.userAnswersSubject.asObservable();

  private flaggedQuestionsSubject = new BehaviorSubject<number[]>([]);
  public flaggedQuestions$ = this.flaggedQuestionsSubject.asObservable();

  // Timer for Mock Test
  private timeRemainingSubject = new BehaviorSubject<number>(0); // in seconds
  public timeRemaining$ = this.timeRemainingSubject.asObservable();

  private timeElapsedSubject = new BehaviorSubject<number>(0);
  public timeElapsed$ = this.timeElapsedSubject.asObservable();

  private lastCompletedAttemptSubject = new BehaviorSubject<QuizAttempt | null>(null);
  public lastCompletedAttempt$ = this.lastCompletedAttemptSubject.asObservable();

  private timerSubscription?: Subscription;
  private totalDurationSeconds: number = 0;

  constructor(
    private storageService: StorageService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  /**
   * Start a new quiz session with questions and config
   */
  public startQuiz(quizResponse: QuizResponse, config: QuizConfig): void {
    this.stopTimer();

    this.activeConfigSubject.next(config);
    this.activeQuestionsSubject.next(quizResponse.questions);
    this.currentQuestionIndexSubject.next(0);
    this.userAnswersSubject.next({});
    this.flaggedQuestionsSubject.next([]);
    this.timeElapsedSubject.next(0);

    // If Mock Test, set 1.2 minutes per question (TET standard: 150 mins for 150 questions => 1 min per Q + buffer)
    if (config.mode === 'mock') {
      const minutesPerQuestion = 1.0;
      this.totalDurationSeconds = Math.max(60, Math.round(quizResponse.questions.length * minutesPerQuestion * 60));
      this.timeRemainingSubject.next(this.totalDurationSeconds);
      this.startMockTimer();
    } else {
      this.totalDurationSeconds = 0;
      this.timeRemainingSubject.next(0);
      this.startPracticeTimer();
    }

    this.router.navigate(['/quiz']);
  }

  /**
   * Select an answer for a specific question
   */
  public selectAnswer(questionId: number, optionIndex: number): void {
    const current = { ...this.userAnswersSubject.value };
    if (current[questionId] === optionIndex) {
      // Allow deselecting if in practice mode or keep selected
      // In standard quiz, clicking the same option maintains selection
      current[questionId] = optionIndex;
    } else {
      current[questionId] = optionIndex;
    }
    this.userAnswersSubject.next(current);
  }

  /**
   * Toggle flagged/marked for review state for a question
   */
  public toggleFlagQuestion(questionId: number): void {
    const current = [...this.flaggedQuestionsSubject.value];
    const index = current.indexOf(questionId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(questionId);
    }
    this.flaggedQuestionsSubject.next(current);
  }

  public goToQuestion(index: number): void {
    const total = this.activeQuestionsSubject.value.length;
    if (index >= 0 && index < total) {
      this.currentQuestionIndexSubject.next(index);
    }
  }

  public nextQuestion(): void {
    const current = this.currentQuestionIndexSubject.value;
    const total = this.activeQuestionsSubject.value.length;
    if (current < total - 1) {
      this.currentQuestionIndexSubject.next(current + 1);
    }
  }

  public previousQuestion(): void {
    const current = this.currentQuestionIndexSubject.value;
    if (current > 0) {
      this.currentQuestionIndexSubject.next(current - 1);
    }
  }

  /**
   * Submit quiz, calculate score, record attempt, navigate to results
   */
  public submitQuiz(): QuizAttempt {
    this.stopTimer();

    const config = this.activeConfigSubject.value;
    const questions = this.activeQuestionsSubject.value;
    const answers = this.userAnswersSubject.value;
    const timeTaken = this.timeElapsedSubject.value;

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const subjectsSet = new Set<string>();

    questions.forEach(q => {
      if (q.subject) subjectsSet.add(q.subject);
      const userSelected = answers[q.id];
      if (userSelected === undefined || userSelected === -1) {
        skippedCount++;
      } else if (userSelected === q.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      quizTitle: config?.quizType === 'subject' ? `Primary TET ${config.subject} Quiz` : 'Primary TET Mixed Mock Test',
      quizType: config?.quizType || 'mixed',
      subjects: Array.from(subjectsSet),
      score: correctCount,
      accuracy: accuracy,
      totalQuestions: totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      skippedAnswers: skippedCount,
      timeTakenSeconds: timeTaken,
      date: new Date().toISOString(),
      mode: config?.mode || 'practice',
      questions: questions,
      userAnswers: answers
    };

    // Save to storage
    this.storageService.saveQuizAttempt(attempt);
    this.lastCompletedAttemptSubject.next(attempt);

    // Navigate to results
    this.router.navigate(['/results']);
    return attempt;
  }

  /**
   * Get the last completed attempt or fetch latest from storage
   */
  public getLastAttempt(): QuizAttempt | null {
    if (this.lastCompletedAttemptSubject.value) {
      return this.lastCompletedAttemptSubject.value;
    }
    const all = this.storageService.getQuizAttempts();
    return all.length > 0 ? all[0] : null;
  }

  /**
   * Reset active state
   */
  public clearActiveQuiz(): void {
    this.stopTimer();
    this.activeConfigSubject.next(null);
    this.activeQuestionsSubject.next([]);
    this.currentQuestionIndexSubject.next(0);
    this.userAnswersSubject.next({});
    this.flaggedQuestionsSubject.next([]);
  }

  private startMockTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.ngZone.run(() => {
        const remaining = this.timeRemainingSubject.value - 1;
        const elapsed = this.timeElapsedSubject.value + 1;
        this.timeElapsedSubject.next(elapsed);

        if (remaining <= 0) {
          this.timeRemainingSubject.next(0);
          this.submitQuiz(); // Auto submit on 0:00
        } else {
          this.timeRemainingSubject.next(remaining);
        }
      });
    });
  }

  private startPracticeTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.ngZone.run(() => {
        const elapsed = this.timeElapsedSubject.value + 1;
        this.timeElapsedSubject.next(elapsed);
      });
    });
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }
}
