import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PyqService } from '../../services/pyq.service';
import { GeminiService } from '../../services/gemini.service';
import { QuizService } from '../../services/quiz.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { PreviousYearQuestion, QuizQuestion, TET_SUBJECTS } from '../../shared/models/quiz.model';

@Component({
  selector: 'app-previous-year',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './previous-year.component.html',
  styleUrl: './previous-year.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviousYearComponent implements OnInit {
  public subjects = TET_SUBJECTS;
  public allYears: number[] = [2023, 2022, 2021, 2017, 2015, 2014];
  public selectedYear: number = 2023;
  public selectedSubject: string = 'all';
  public selectedTopic: string = 'all';
  public availableTopics: string[] = [];
  public selectedCount: number = 10;
  public searchQuery: string = '';

  public questions: PreviousYearQuestion[] = [];
  public revealedMap: { [id: string | number]: boolean } = {};
  public aiExplanationMap: { [id: string | number]: string } = {};
  public similarQuestionMap: { [id: string | number]: QuizQuestion } = {};
  public isExplainingMap: { [id: string | number]: boolean } = {};
  public isGeneratingSimilarMap: { [id: string | number]: boolean } = {};

  public isLoadingAi: boolean = false;
  public isAiGenerated: boolean = false;
  public apiErrorMessage: string = '';
  public currentLang: string = 'bn';

  constructor(
    private pyqService: PyqService,
    private geminiService: GeminiService,
    private quizService: QuizService,
    private langService: LanguageService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentLang = this.langService.currentLanguage;
    this.allYears = this.pyqService.getAvailableYears();
    this.updateAvailableTopics();

    this.langService.currentLang$.subscribe(l => {
      this.currentLang = l;
      this.cdr.markForCheck();
    });

    // Check for query parameters e.g., /previous-year?year=2023&subject=Mathematics
    this.route.queryParams.subscribe(params => {
      if (params['year']) {
        const y = Number(params['year']);
        if (!isNaN(y) && this.allYears.includes(y)) {
          this.selectedYear = y;
        }
      }
      if (params['subject']) {
        this.selectedSubject = params['subject'];
        this.updateAvailableTopics();
      }
      this.fetchWithGemini();
    });

    this.cdr.detectChanges();
  }

  public updateAvailableTopics(): void {
    this.availableTopics = this.pyqService.getTopicsBySubject(this.selectedSubject);
  }

  public selectYear(year: number): void {
    this.selectedYear = year;
    this.fetchWithGemini();
  }

  public selectSubject(subjectId: string): void {
    this.selectedSubject = subjectId;
    this.selectedTopic = 'all';
    this.updateAvailableTopics();
    this.fetchWithGemini();
  }

  public selectTopic(topic: string): void {
    this.selectedTopic = topic;
    this.fetchWithGemini();
  }

  public applyFilters(): void {
    this.fetchWithGemini();
  }

  /**
   * Fetch/generate authentic previous year questions for the selected year and subject using Gemini AI.
   */
  public fetchWithGemini(): void {
    if (this.isLoadingAi) return;

    this.isLoadingAi = true;
    this.apiErrorMessage = '';
    this.revealedMap = {};
    this.aiExplanationMap = {};
    this.similarQuestionMap = {};
    this.cdr.markForCheck();

    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';
    const topicParam = this.selectedTopic === 'all' ? undefined : this.selectedTopic;

    this.pyqService.fetchPyqFromGemini(this.selectedYear, this.selectedSubject, this.selectedCount, topicParam, lang).subscribe({
      next: (response) => {
        this.isLoadingAi = false;
        this.isAiGenerated = true;
        this.questions = response;
        this.updateAvailableTopics();
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.isLoadingAi = false;
        this.apiErrorMessage = err.message || 'Gemini API Error: Failed to generate PYQ exam paper.';
        console.warn('Gemini PYQ failed, falling back to local dataset:', err);
        this.loadOfflineFallback();
        this.cdr.markForCheck();
      }
    });
  }

  public loadOfflineFallback(): void {
    this.pyqService.filterQuestions({
      year: this.selectedYear as any,
      subject: this.selectedSubject === 'all' ? 'all' : this.selectedSubject,
      topic: this.selectedTopic === 'all' ? 'all' : this.selectedTopic,
      searchQuery: this.searchQuery
    }).subscribe(res => {
      this.isAiGenerated = false;
      this.questions = res.slice(0, this.selectedCount);
      this.updateAvailableTopics();
      this.cdr.markForCheck();
    });
  }

  public toggleReveal(id: string | number): void {
    this.revealedMap[id] = !this.revealedMap[id];
    this.cdr.markForCheck();
  }

  public explainWithAi(q: PreviousYearQuestion): void {
    this.isExplainingMap[q.id] = true;
    this.cdr.markForCheck();

    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';
    this.geminiService.generateExplanation(q.question, q.options, q.correctAnswer, undefined, lang).subscribe({
      next: (exp) => {
        this.aiExplanationMap[q.id] = exp;
        this.isExplainingMap[q.id] = false;
        this.revealedMap[q.id] = true; // Auto reveal
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isExplainingMap[q.id] = false;
        this.aiExplanationMap[q.id] = `Gemini explanation error: ${err.message}`;
        this.cdr.markForCheck();
      }
    });
  }

  public generateSimilarWithAi(q: PreviousYearQuestion): void {
    this.isGeneratingSimilarMap[q.id] = true;
    this.cdr.markForCheck();

    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';
    const baseQ: QuizQuestion = {
      id: 1,
      subject: q.subject || 'General',
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      difficulty: (q.difficulty as any) || 'Medium'
    };

    this.geminiService.generateSimilarQuiz(baseQ, 10, lang).subscribe({
      next: (response) => {
        this.isGeneratingSimilarMap[q.id] = false;
        this.cdr.markForCheck();
        // Automatically start the 10 similar questions quiz
        this.quizService.startQuiz(response, {
          quizType: 'subject',
          subject: q.subject,
          numberOfQuestions: 10,
          difficulty: (q.difficulty as any) || 'Medium',
          language: lang as any,
          mode: 'practice'
        });
      },
      error: (err) => {
        this.isGeneratingSimilarMap[q.id] = false;
        this.apiErrorMessage = err.message || 'Gemini API Error: Unable to generate 10 similar questions.';
        console.error('Similar Q error:', err);
        this.cdr.markForCheck();
      }
    });
  }

  public getSubjectDisplayName(subId: string): string {
    const found = TET_SUBJECTS.find(s => s.id.toLowerCase() === subId?.toLowerCase());
    if (!found) return subId || 'General';
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

  public startPyqMockTest(): void {
    if (this.questions.length === 0) return;

    const formattedQuestions: QuizQuestion[] = this.questions.map((q, idx) => ({
      id: idx + 1,
      subject: q.subject,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty as any
    }));

    this.quizService.startQuiz(
      {
        quizTitle: `WB Primary TET ${this.selectedYear} Mock Test`,
        language: this.langService.currentLanguage === 'en' ? 'English' : 'Bengali',
        questions: formattedQuestions
      },
      {
        quizType: this.selectedSubject === 'all' ? 'mixed' : 'subject',
        subject: this.selectedSubject === 'all' ? undefined : this.selectedSubject,
        numberOfQuestions: formattedQuestions.length,
        difficulty: 'Mixed',
        language: this.langService.currentLanguage === 'en' ? 'English' : 'Bengali',
        mode: 'mock'
      }
    );
  }

  public startPyqPracticeTest(): void {
    if (this.questions.length === 0) return;

    const formattedQuestions: QuizQuestion[] = this.questions.map((q, idx) => ({
      id: idx + 1,
      subject: q.subject,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty as any
    }));

    this.quizService.startQuiz(
      {
        quizTitle: `WB Primary TET ${this.selectedYear} Practice`,
        language: this.langService.currentLanguage === 'en' ? 'English' : 'Bengali',
        questions: formattedQuestions
      },
      {
        quizType: this.selectedSubject === 'all' ? 'mixed' : 'subject',
        subject: this.selectedSubject === 'all' ? undefined : this.selectedSubject,
        numberOfQuestions: formattedQuestions.length,
        difficulty: 'Mixed',
        language: this.langService.currentLanguage === 'en' ? 'English' : 'Bengali',
        mode: 'practice'
      }
    );
  }
}
