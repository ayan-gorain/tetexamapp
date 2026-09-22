import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { GeminiService } from '../../services/gemini.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { QuizAttempt, SubjectPerformance, QuizQuestion, TET_SUBJECTS } from '../../shared/models/quiz.model';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultComponent implements OnInit {
  public attempt: QuizAttempt | null = null;
  public subjectBreakdown: SubjectPerformance[] = [];
  public strongSubjects: string[] = [];
  public weakSubjects: string[] = [];
  public missedQuestions: QuizQuestion[] = [];
  public primaryWeakSubject: string = '';

  public aiMentorAdvice: string = '';
  public isLoadingAiSummary: boolean = false;
  public isGeneratingDrill: boolean = false;

  constructor(
    private quizService: QuizService,
    private geminiService: GeminiService,
    private langService: LanguageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.attempt = this.quizService.getLastAttempt();

    if (this.attempt) {
      this.calculateSubjectBreakdown();
      this.extractDiagnosticData();

      if (this.attempt.accuracy >= 60) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    }

    this.langService.currentLang$.subscribe(() => {
      this.cdr.markForCheck();
    });

    this.cdr.markForCheck();
  }

  private calculateSubjectBreakdown(): void {
    if (!this.attempt) return;

    const map: { [subject: string]: { total: number; correct: number } } = {};

    this.attempt.questions.forEach(q => {
      const sub = q.subject || 'General';
      if (!map[sub]) {
        map[sub] = { total: 0, correct: 0 };
      }
      map[sub].total += 1;
      if (this.attempt!.userAnswers[q.id] === q.correctAnswer) {
        map[sub].correct += 1;
      }
    });

    this.subjectBreakdown = Object.keys(map).map(sub => ({
      subject: sub,
      totalQuestions: map[sub].total,
      correctCount: map[sub].correct,
      accuracy: Math.round((map[sub].correct / map[sub].total) * 100)
    }));
  }

  private extractDiagnosticData(): void {
    if (!this.attempt) return;

    this.strongSubjects = this.subjectBreakdown.filter(s => s.accuracy >= 70).map(s => s.subject);
    this.weakSubjects = this.subjectBreakdown.filter(s => s.accuracy < 60).map(s => s.subject);

    // Identify missed/incorrect questions
    this.missedQuestions = this.attempt.questions.filter(
      q => this.attempt!.userAnswers[q.id] !== q.correctAnswer
    );

    if (this.weakSubjects.length > 0) {
      this.primaryWeakSubject = this.weakSubjects[0];
    } else if (this.missedQuestions.length > 0) {
      this.primaryWeakSubject = this.missedQuestions[0].subject || 'Mathematics';
    } else {
      this.primaryWeakSubject = '';
    }
  }

  public getDetailedAiMentorAdvice(): void {
    if (!this.attempt || this.isLoadingAiSummary) return;

    this.isLoadingAiSummary = true;
    this.cdr.markForCheck();
    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';

    this.geminiService.generatePerformanceSummary(this.attempt, lang).subscribe({
      next: (advice) => {
        this.aiMentorAdvice = advice;
        this.isLoadingAiSummary = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoadingAiSummary = false;
        this.aiMentorAdvice = `Gemini AI analysis error: ${err.message}`;
        this.cdr.markForCheck();
      }
    });
  }

  public startDrillOnWeakSubject(): void {
    if (!this.primaryWeakSubject || this.isGeneratingDrill) return;

    this.isGeneratingDrill = true;
    this.cdr.markForCheck();
    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';

    this.geminiService.generateSubjectQuiz(this.primaryWeakSubject, 10, 'Medium', lang).subscribe({
      next: (response) => {
        this.isGeneratingDrill = false;
        this.cdr.markForCheck();
        this.quizService.startQuiz(response, {
          quizType: 'subject',
          subject: this.primaryWeakSubject,
          numberOfQuestions: 10,
          difficulty: 'Medium',
          language: lang as any,
          mode: 'practice'
        });
      },
      error: (err) => {
        this.isGeneratingDrill = false;
        alert(`Failed to generate targeted drill questions: ${err.message}`);
        this.cdr.markForCheck();
      }
    });
  }

  public getSubjectDisplayName(subId: string): string {
    const found = TET_SUBJECTS.find(s => s.id.toLowerCase() === subId.toLowerCase());
    if (!found) return subId;
    return this.langService.currentLanguage === 'en' ? found.nameEn : found.nameBn;
  }

  public reviewAnswers(): void {
    if (this.attempt) {
      this.router.navigate(['/review'], { state: { attempt: this.attempt } });
    }
  }

  public tryAgain(): void {
    if (this.attempt) {
      this.quizService.startQuiz(
        {
          quizTitle: this.attempt.quizTitle,
          language: this.langService.currentLanguage === 'en' ? 'English' : 'Bengali',
          questions: this.attempt.questions
        },
        {
          quizType: this.attempt.quizType as any,
          numberOfQuestions: this.attempt.totalQuestions,
          difficulty: 'Mixed',
          language: this.langService.currentLanguage === 'en' ? 'English' : 'Bengali',
          mode: this.attempt.mode
        }
      );
    }
  }

  public formatTime(seconds: number): string {
    if (!seconds) return this.langService.currentLanguage === 'en' ? '0 seconds' : '০ সেকেন্ড';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (this.langService.currentLanguage === 'en') {
      return mins === 0 ? `${secs} seconds` : `${mins} min ${secs} sec`;
    }
    return mins === 0 ? `${secs} সেকেন্ড` : `${mins} মিনিট ${secs} সেকেন্ড`;
  }
}
