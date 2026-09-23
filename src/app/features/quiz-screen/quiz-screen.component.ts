import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { QuizService } from '../../services/quiz.service';
import { GeminiService } from '../../services/gemini.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { QuizQuestion, QuizConfig, TET_SUBJECTS, TopicNote } from '../../shared/models/quiz.model';
import { TopicStudyModalComponent } from '../../shared/components/topic-study-modal/topic-study-modal.component';

@Component({
  selector: 'app-quiz-screen',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, TopicStudyModalComponent],
  templateUrl: './quiz-screen.component.html',
  styleUrl: './quiz-screen.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizScreenComponent implements OnInit, OnDestroy {
  public config: QuizConfig | null = null;
  public questions: QuizQuestion[] = [];
  public currentIndex: number = 0;
  public userAnswers: { [questionId: number]: number } = {};
  public flaggedQuestions: number[] = [];
  public timeRemaining: number = 0;
  public showPalette: boolean = true;
  public confirmSubmitModal: boolean = false;

  public isStudyModalOpen: boolean = false;
  public isGeneratingSimilar: boolean = false;
  public similarError: string = '';

  private subs: Subscription = new Subscription();

  constructor(
    private quizService: QuizService,
    private geminiService: GeminiService,
    private langService: LanguageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.subs.add(
      this.quizService.activeConfig$.subscribe(c => {
        this.config = c;
        this.cdr.markForCheck();
      })
    );
    this.subs.add(
      this.quizService.activeQuestions$.subscribe(q => {
        this.questions = q;
        this.cdr.markForCheck();
      })
    );
    this.subs.add(
      this.quizService.currentQuestionIndex$.subscribe(idx => {
        this.currentIndex = idx;
        this.cdr.markForCheck();
      })
    );
    this.subs.add(
      this.quizService.userAnswers$.subscribe(ans => {
        this.userAnswers = ans;
        this.cdr.markForCheck();
      })
    );
    this.subs.add(
      this.quizService.flaggedQuestions$.subscribe(fl => {
        this.flaggedQuestions = fl;
        this.cdr.markForCheck();
      })
    );
    this.subs.add(
      this.quizService.timeRemaining$.subscribe(t => {
        this.timeRemaining = t;
        this.cdr.markForCheck();
      })
    );
    this.subs.add(
      this.langService.currentLang$.subscribe(() => {
        this.cdr.markForCheck();
      })
    );

    if (this.questions.length === 0) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public get currentQuestion(): QuizQuestion {
    return this.questions[this.currentIndex] || {
      id: 0,
      subject: '',
      question: '',
      options: [],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'Medium'
    };
  }

  public get progressPercentage(): number {
    if (this.questions.length === 0) return 0;
    return ((this.currentIndex + 1) / this.questions.length) * 100;
  }

  public get answeredCount(): number {
    return Object.keys(this.userAnswers).filter(k => this.userAnswers[Number(k)] !== undefined && this.userAnswers[Number(k)] !== -1).length;
  }

  public get flaggedCount(): number {
    return this.flaggedQuestions.length;
  }

  public selectOption(optionIndex: number): void {
    if (this.currentQuestion) {
      this.quizService.selectAnswer(this.currentQuestion.id, optionIndex);
      this.cdr.markForCheck();
    }
  }

  public isFlagged(questionId: number): boolean {
    return this.flaggedQuestions.includes(questionId);
  }

  public toggleFlag(): void {
    if (this.currentQuestion) {
      this.quizService.toggleFlagQuestion(this.currentQuestion.id);
      this.cdr.markForCheck();
    }
  }

  public goToQuestion(idx: number): void {
    this.quizService.goToQuestion(idx);
    this.cdr.markForCheck();
  }

  public nextQuestion(): void {
    this.quizService.nextQuestion();
    this.cdr.markForCheck();
  }

  public previousQuestion(): void {
    this.quizService.previousQuestion();
    this.cdr.markForCheck();
  }

  public submitQuizNow(): void {
    this.confirmSubmitModal = false;
    this.cdr.markForCheck();
    this.quizService.submitQuiz();
  }

  public getSubjectDisplayName(subId: string): string {
    const found = TET_SUBJECTS.find(s => s.id.toLowerCase() === subId.toLowerCase());
    if (!found) return subId;
    return this.langService.currentLanguage === 'en' ? found.nameEn : found.nameBn;
  }

  public getOptionLetter(index: number): string {
    if (this.langService.currentLanguage === 'bn') {
      const bengaliLetters = ['ক', 'খ', 'গ', 'ঘ'];
      return bengaliLetters[index] || String.fromCharCode(65 + index);
    }
    const englishLetters = ['A', 'B', 'C', 'D'];
    return englishLetters[index] || String.fromCharCode(65 + index);
  }

  public formatTimeRemaining(totalSeconds: number): string {
    if (totalSeconds <= 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
    return `${pad(mins)}:${pad(secs)}`;
  }

  public isCurrentAnswered(): boolean {
    const ans = this.userAnswers[this.currentQuestion.id];
    return ans !== undefined && ans !== -1;
  }

  public isCurrentWrong(): boolean {
    const ans = this.userAnswers[this.currentQuestion.id];
    return ans !== undefined && ans !== -1 && ans !== this.currentQuestion.correctAnswer;
  }

  public isCurrentCorrect(): boolean {
    const ans = this.userAnswers[this.currentQuestion.id];
    return ans !== undefined && ans === this.currentQuestion.correctAnswer;
  }

  public openTopicStudyModal(): void {
    this.isStudyModalOpen = true;
    this.cdr.markForCheck();
  }

  public closeTopicStudyModal(): void {
    this.isStudyModalOpen = false;
    this.cdr.markForCheck();
  }

  public generate10SimilarQuestions(): void {
    this.isGeneratingSimilar = true;
    this.similarError = '';
    this.cdr.markForCheck();

    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';
    this.geminiService.generateSimilarQuiz(this.currentQuestion, 10, lang).subscribe({
      next: (response) => {
        this.isGeneratingSimilar = false;
        this.cdr.markForCheck();
        this.quizService.startQuiz(response, {
          quizType: 'subject',
          subject: this.currentQuestion.subject,
          numberOfQuestions: 10,
          difficulty: this.currentQuestion.difficulty || 'Medium',
          language: lang as any,
          mode: 'practice'
        });
      },
      error: (err: Error) => {
        this.isGeneratingSimilar = false;
        this.similarError = err.message || 'Gemini API Error: Unable to generate 10 similar questions.';
        this.cdr.markForCheck();
      }
    });
  }

  public startTopicPractice(note: TopicNote): void {
    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';
    this.geminiService.generateQuizFromTopicNote(note, 10, lang).subscribe({
      next: (response) => {
        this.quizService.startQuiz(response, {
          quizType: 'subject',
          subject: note.subject,
          numberOfQuestions: 10,
          difficulty: 'Medium',
          language: lang as any,
          mode: 'practice'
        });
      },
      error: (err: Error) => {
        alert(err.message || 'Gemini API Error: Unable to generate practice quiz for this topic.');
      }
    });
  }
}

