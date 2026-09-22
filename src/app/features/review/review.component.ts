import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { GeminiService } from '../../services/gemini.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { QuizAttempt, QuizQuestion, TET_SUBJECTS } from '../../shared/models/quiz.model';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewComponent implements OnInit {
  public attempt: QuizAttempt | null = null;
  public userAnswerMap: { [questionId: number]: number } = {};
  public activeFilter: 'all' | 'correct' | 'incorrect' | 'skipped' = 'all';

  public aiExplaining: { [questionId: number]: boolean } = {};
  public aiExplanationLoading: { [questionId: number]: boolean } = {};
  public aiExplanations: { [questionId: number]: string } = {};
  public aiExplanationError: { [questionId: number]: string } = {};

  public similarLoading: { [questionId: number]: boolean } = {};
  public similarError: { [questionId: number]: string } = {};

  constructor(
    private quizService: QuizService,
    private geminiService: GeminiService,
    private langService: LanguageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state && nav.extras.state['attempt']) {
      this.attempt = nav.extras.state['attempt'];
    }
  }

  ngOnInit(): void {
    if (!this.attempt) {
      this.attempt = this.quizService.getLastAttempt();
    }

    if (this.attempt) {
      this.userAnswerMap = this.attempt.userAnswers || {};
    }

    this.langService.currentLang$.subscribe(() => {
      this.cdr.markForCheck();
    });
    this.cdr.markForCheck();
  }

  public get filteredQuestions(): QuizQuestion[] {
    if (!this.attempt) return [];
    if (this.activeFilter === 'all') return this.attempt.questions;
    if (this.activeFilter === 'correct') {
      return this.attempt.questions.filter(q => this.isUserCorrect(q));
    }
    if (this.activeFilter === 'incorrect') {
      return this.attempt.questions.filter(q => this.isUserIncorrect(q));
    }
    if (this.activeFilter === 'skipped') {
      return this.attempt.questions.filter(q => this.isUserSkipped(q));
    }
    return this.attempt.questions;
  }

  public isUserCorrect(q: QuizQuestion): boolean {
    return this.userAnswerMap[q.id] === q.correctAnswer;
  }

  public isUserIncorrect(q: QuizQuestion): boolean {
    const ans = this.userAnswerMap[q.id];
    return ans !== undefined && ans !== -1 && ans !== q.correctAnswer;
  }

  public isUserSkipped(q: QuizQuestion): boolean {
    const ans = this.userAnswerMap[q.id];
    return ans === undefined || ans === -1;
  }

  public getSubjectDisplayName(subId: string): string {
    const found = TET_SUBJECTS.find(s => s.id.toLowerCase() === subId.toLowerCase());
    if (!found) return subId;
    return this.langService.currentLanguage === 'en' ? found.nameEn : found.nameBn;
  }

  public getOptionLetter(index: number): string {
    if (this.langService.currentLanguage === 'bn') {
      const letters = ['ক', 'খ', 'গ', 'ঘ'];
      return letters[index] || String.fromCharCode(65 + index);
    }
    const letters = ['A', 'B', 'C', 'D'];
    return letters[index] || String.fromCharCode(65 + index);
  }

  public requestAiExplanation(q: QuizQuestion): void {
    this.aiExplaining[q.id] = true;
    this.aiExplanationLoading[q.id] = true;
    this.aiExplanationError[q.id] = '';
    this.cdr.markForCheck();
    const userAns = this.userAnswerMap[q.id];
    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';

    this.geminiService.generateExplanation(q.question, q.options, q.correctAnswer, userAns, lang).subscribe({
      next: (exp) => {
        this.aiExplanations[q.id] = exp;
        this.aiExplanationLoading[q.id] = false;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.aiExplanationError[q.id] = err.message || 'Failed to load Gemini explanation.';
        this.aiExplanationLoading[q.id] = false;
        this.cdr.markForCheck();
      }
    });
  }

  public generateSimilarQuiz(q: QuizQuestion): void {
    this.similarLoading[q.id] = true;
    this.similarError[q.id] = '';
    this.cdr.markForCheck();
    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';

    this.geminiService.generateSimilarQuiz(q, 10, lang).subscribe({
      next: (response) => {
        this.similarLoading[q.id] = false;
        this.cdr.markForCheck();
        // Start live practice quiz with the 10 similar questions
        this.quizService.startQuiz(response, {
          quizType: 'subject',
          subject: q.subject,
          numberOfQuestions: 10,
          difficulty: q.difficulty || 'Medium',
          language: lang as any,
          mode: 'practice'
        });
      },
      error: (err: Error) => {
        this.similarError[q.id] = err.message || 'Gemini API Error: Unable to generate 10 similar questions.';
        this.similarLoading[q.id] = false;
        this.cdr.markForCheck();
      }
    });
  }
}
