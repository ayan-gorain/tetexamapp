import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { User } from 'firebase/auth';
import { StorageService } from '../../services/storage.service';
import { GeminiService } from '../../services/gemini.service';
import { PyqService } from '../../services/pyq.service';
import { QuizService } from '../../services/quiz.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { UserStats, QuizAttempt, TET_SUBJECTS, TopicNote } from '../../shared/models/quiz.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  public allSubjects = TET_SUBJECTS;
  public selectedSubject: string = 'mixed';
  public selectedCount: number = 10;
  public selectedMode: 'mock' | 'practice' = 'mock';
  public selectedDifficulty: string = 'Mixed';

  public stats: UserStats = {
    totalQuizzes: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    overallAccuracy: 0,
    currentStreak: 1,
    subjectStats: {}
  };

  public recentAttempts: QuizAttempt[] = [];
  public savedNotes: TopicNote[] = [];
  public weakestSubject: string = '';
  public isGenerating = false;
  public apiErrorMessage = '';
  public currentUser: User | null = null;
  public showAllResultsModal: boolean = false;


  constructor(
    private storageService: StorageService,
    private geminiService: GeminiService,
    private pyqService: PyqService,
    private quizService: QuizService,
    private langService: LanguageService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Immediate synchronous snapshot
    this.stats = this.storageService.getUserStats();
    this.weakestSubject = this.storageService.getWeakestSubject();
    this.recentAttempts = this.storageService.getQuizAttempts();
    this.currentUser = this.authService.currentUser;

    this.storageService.stats$.subscribe(s => {
      this.stats = s;
      this.weakestSubject = this.storageService.getWeakestSubject();
      this.cdr.markForCheck();
    });

    this.storageService.attempts$.subscribe(attempts => {
      this.recentAttempts = attempts;
      this.cdr.markForCheck();
    });

    this.storageService.savedNotes$.subscribe(notes => {
      this.savedNotes = notes || [];
      this.cdr.markForCheck();
    });

    this.langService.currentLang$.subscribe(() => {
      this.cdr.markForCheck();
    });

    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });

    this.cdr.detectChanges();
  }


  public async loginWithGoogle(): Promise<void> {
    await this.authService.loginWithGoogle();
    this.cdr.markForCheck();
  }

  public selectSubject(subjectId: string): void {
    this.selectedSubject = subjectId;
    this.cdr.markForCheck();
  }

  public selectCount(count: number): void {
    this.selectedCount = count;
    this.cdr.markForCheck();
  }

  public selectMode(mode: 'mock' | 'practice'): void {
    this.selectedMode = mode;
    this.cdr.markForCheck();
  }

  public getSubjectDisplayName(subId: string): string {
    const found = TET_SUBJECTS.find(s => s.id.toLowerCase() === subId.toLowerCase());
    if (!found) return subId;
    return this.langService.currentLanguage === 'en' ? found.nameEn : found.nameBn;
  }

  public getSubjectIcon(subId: string): string {
    const found = TET_SUBJECTS.find(s => s.id.toLowerCase() === subId.toLowerCase());
    return found ? found.icon : 'bi-journal';
  }

  public getSubjectColor(subId: string): string {
    const found = TET_SUBJECTS.find(s => s.id.toLowerCase() === subId.toLowerCase());
    return found ? found.color : '#2563eb';
  }

  public startHubPractice(): void {
    if (this.isGenerating) return;

    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';
    const isMixed = this.selectedSubject === 'mixed';

    this.isGenerating = true;
    this.apiErrorMessage = '';
    this.cdr.markForCheck();

    const observable = isMixed
      ? this.geminiService.generateMixedQuiz(this.selectedCount, this.selectedDifficulty, lang)
      : this.geminiService.generateSubjectQuiz(this.selectedSubject, this.selectedCount, this.selectedDifficulty === 'Mixed' ? 'Medium' : this.selectedDifficulty, lang);

    observable.subscribe({
      next: (response) => {
        this.isGenerating = false;
        this.cdr.markForCheck();
        this.quizService.startQuiz(response, {
          quizType: isMixed ? 'mixed' : 'subject',
          subject: isMixed ? undefined : this.selectedSubject,
          numberOfQuestions: this.selectedCount,
          difficulty: this.selectedDifficulty as any,
          language: lang as any,
          mode: this.selectedMode
        });
      },
      error: (err: Error) => {
        this.isGenerating = false;
        this.apiErrorMessage = err.message || 'Gemini API Error: Failed to generate quiz.';
        this.cdr.markForCheck();
        console.error('Gemini API Failure:', err);
      }
    });
  }

  public startDirectMixedMockTest(): void {
    this.selectedSubject = 'mixed';
    this.selectedMode = 'mock';
    this.startHubPractice();
  }

  public startDirectSubjectPractice(subject: string): void {
    this.selectedSubject = subject;
    this.selectedMode = 'practice';
    this.startHubPractice();
  }

  public openAllResultsModal(): void {
    this.showAllResultsModal = true;
    this.cdr.markForCheck();
  }

  public closeAllResultsModal(): void {
    this.showAllResultsModal = false;
    this.cdr.markForCheck();
  }

  public reviewAttempt(attempt: QuizAttempt): void {
    this.router.navigate(['/review'], { state: { attempt } });
  }

  public clearHistory(): void {
    const msg = this.langService.currentLanguage === 'en'
      ? 'Are you sure you want to clear all quiz history and stats?'
      : 'আপনি কি নিশ্চিত যে আপনার সমস্ত কুইজের হিস্ট্রি ও স্ট্যাটাস মুছে ফেলতে চান?';
    if (confirm(msg)) {
      this.storageService.clearAllData();
    }
  }

  public formatDate(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const locale = this.langService.currentLanguage === 'en' ? 'en-US' : 'bn-IN';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  public formatTime(seconds: number): string {
    if (!seconds) return this.langService.currentLanguage === 'en' ? '0s' : '০ সে.';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (this.langService.currentLanguage === 'en') {
      return mins === 0 ? `${secs}s` : `${mins}m ${secs}s`;
    }
    return mins === 0 ? `${secs} সে.` : `${mins} মি. ${secs} সে.`;
  }
}
