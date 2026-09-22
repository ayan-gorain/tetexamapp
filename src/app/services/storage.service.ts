import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { QuizAttempt, UserStats, SubjectPerformance, TET_SUBJECTS } from '../shared/models/quiz.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly BASE_ATTEMPTS_KEY = 'tet_master_quiz_attempts';
  private readonly BASE_STATS_KEY = 'tet_master_user_stats';

  private currentUserId: string = 'guest';

  private attemptsSubject = new BehaviorSubject<QuizAttempt[]>([]);
  public attempts$: Observable<QuizAttempt[]> = this.attemptsSubject.asObservable();

  private statsSubject = new BehaviorSubject<UserStats>(this.getDefaultStats());
  public stats$: Observable<UserStats> = this.statsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      const newUserId = user ? user.uid : 'guest';
      this.switchUser(newUserId);
    });
  }

  /**
   * Switch active user context and load their dedicated history and statistics
   */
  public switchUser(userId: string): void {
    this.currentUserId = userId || 'guest';
    this.loadUserData(this.currentUserId);
  }

  private getAttemptsKey(): string {
    return `${this.BASE_ATTEMPTS_KEY}_${this.currentUserId}`;
  }

  private getStatsKey(): string {
    return `${this.BASE_STATS_KEY}_${this.currentUserId}`;
  }

  private loadUserData(userId: string): void {
    try {
      // If not logged in (guest), keep clean state and remove old legacy test data
      if (userId === 'guest') {
        localStorage.removeItem(this.BASE_ATTEMPTS_KEY);
        localStorage.removeItem(this.BASE_STATS_KEY);
        localStorage.removeItem(`${this.BASE_ATTEMPTS_KEY}_guest`);
        localStorage.removeItem(`${this.BASE_STATS_KEY}_guest`);
        this.attemptsSubject.next([]);
        this.statsSubject.next(this.getDefaultStats());
        return;
      }

      // Logged-in user: load strictly their personal history
      const attemptsKey = this.getAttemptsKey();
      const savedAttempts = localStorage.getItem(attemptsKey);

      if (savedAttempts) {
        const parsed: QuizAttempt[] = JSON.parse(savedAttempts);
        this.attemptsSubject.next(parsed);
      } else {
        this.attemptsSubject.next([]);
      }

      const statsKey = this.getStatsKey();
      const savedStats = localStorage.getItem(statsKey);

      if (savedStats) {
        const parsed: UserStats = JSON.parse(savedStats);
        this.statsSubject.next(parsed);
      } else {
        if (this.attemptsSubject.value.length > 0) {
          this.recalculateStatsFromAttempts();
        } else {
          this.statsSubject.next(this.getDefaultStats());
        }
      }
    } catch (e) {
      console.error(`Error loading storage data for user ${userId}`, e);
      this.attemptsSubject.next([]);
      this.statsSubject.next(this.getDefaultStats());
    }
  }

  /**
   * Save a completed quiz attempt and recalculate statistics & streak
   */
  public saveQuizAttempt(attempt: QuizAttempt): void {
    const currentAttempts = this.attemptsSubject.value;
    const updatedAttempts = [attempt, ...currentAttempts];
    
    this.attemptsSubject.next(updatedAttempts);
    try {
      localStorage.setItem(this.getAttemptsKey(), JSON.stringify(updatedAttempts));
    } catch (e) {
      console.error('Failed to persist quiz attempts to localStorage', e);
    }

    this.updateStatsWithNewAttempt(attempt);
  }

  /**
   * Get all quiz attempts
   */
  public getQuizAttempts(): QuizAttempt[] {
    return this.attemptsSubject.value;
  }

  /**
   * Get specific quiz attempt by ID
   */
  public getQuizAttemptById(id: string): QuizAttempt | undefined {
    return this.attemptsSubject.value.find(a => a.id === id);
  }

  /**
   * Get current User Stats snapshot
   */
  public getUserStats(): UserStats {
    return this.statsSubject.value;
  }

  /**
   * Subject-wise performance summary
   */
  public getSubjectPerformances(): SubjectPerformance[] {
    const stats = this.statsSubject.value;
    const result: SubjectPerformance[] = [];

    TET_SUBJECTS.forEach(sub => {
      const data = stats.subjectStats[sub.id] || { attempted: 0, correct: 0 };
      const accuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
      result.push({
        subject: sub.id,
        totalQuestions: data.attempted,
        correctCount: data.correct,
        accuracy: accuracy
      });
    });

    return result;
  }

  /**
   * Identify weakest subject for targeted practice suggestion
   */
  public getWeakestSubject(): string {
    const performances = this.getSubjectPerformances();
    // Filter subjects with at least 1 attempted question first
    const attempted = performances.filter(p => p.totalQuestions > 0);
    if (attempted.length === 0) {
      return 'Mathematics'; // default recommendation
    }
    // Sort by lowest accuracy
    attempted.sort((a, b) => a.accuracy - b.accuracy);
    return attempted[0].subject;
  }

  /**
   * Updates user statistics and streak based on a new attempt
   */
  private updateStatsWithNewAttempt(attempt: QuizAttempt): void {
    const currentStats = { ...this.statsSubject.value };
    
    currentStats.totalQuizzes += 1;
    currentStats.totalQuestionsAnswered += attempt.totalQuestions;
    currentStats.totalCorrectAnswers += attempt.correctAnswers;
    currentStats.overallAccuracy = currentStats.totalQuestionsAnswered > 0
      ? Math.round((currentStats.totalCorrectAnswers / currentStats.totalQuestionsAnswered) * 100)
      : 0;

    // Update subject-wise stats
    attempt.questions.forEach(q => {
      const sub = q.subject || 'General';
      if (!currentStats.subjectStats[sub]) {
        currentStats.subjectStats[sub] = { attempted: 0, correct: 0 };
      }
      currentStats.subjectStats[sub].attempted += 1;
      const userAns = attempt.userAnswers[q.id];
      if (userAns === q.correctAnswer) {
        currentStats.subjectStats[sub].correct += 1;
      }
    });

    // Update Streak
    const today = new Date().toISOString().split('T')[0];
    if (!currentStats.lastQuizDate) {
      currentStats.currentStreak = 1;
      currentStats.lastQuizDate = today;
    } else {
      const lastDate = new Date(currentStats.lastQuizDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStats.currentStreak += 1;
        currentStats.lastQuizDate = today;
      } else if (diffDays > 1) {
        currentStats.currentStreak = 1;
        currentStats.lastQuizDate = today;
      }
      // if diffDays === 0, same day, streak unchanged
    }

    this.statsSubject.next(currentStats);
    try {
      localStorage.setItem(this.getStatsKey(), JSON.stringify(currentStats));
    } catch (e) {
      console.error('Failed to persist user stats', e);
    }
  }

  private recalculateStatsFromAttempts(): void {
    const attempts = this.attemptsSubject.value;
    const stats = this.getDefaultStats();

    attempts.forEach(attempt => {
      stats.totalQuizzes += 1;
      stats.totalQuestionsAnswered += attempt.totalQuestions;
      stats.totalCorrectAnswers += attempt.correctAnswers;

      attempt.questions.forEach(q => {
        const sub = q.subject || 'General';
        if (!stats.subjectStats[sub]) {
          stats.subjectStats[sub] = { attempted: 0, correct: 0 };
        }
        stats.subjectStats[sub].attempted += 1;
        if (attempt.userAnswers[q.id] === q.correctAnswer) {
          stats.subjectStats[sub].correct += 1;
        }
      });
    });

    stats.overallAccuracy = stats.totalQuestionsAnswered > 0
      ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100)
      : 0;

    this.statsSubject.next(stats);
  }

  public clearAllData(): void {
    localStorage.removeItem(this.getAttemptsKey());
    localStorage.removeItem(this.getStatsKey());
    this.attemptsSubject.next([]);
    this.statsSubject.next(this.getDefaultStats());
  }

  private getDefaultStats(): UserStats {
    const subjectStats: { [key: string]: { attempted: number; correct: number } } = {};
    TET_SUBJECTS.forEach(s => {
      subjectStats[s.id] = { attempted: 0, correct: 0 };
    });

    return {
      totalQuizzes: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      overallAccuracy: 0,
      currentStreak: 1,
      subjectStats: subjectStats
    };
  }
}
