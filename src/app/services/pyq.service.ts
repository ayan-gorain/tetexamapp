import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PreviousYearQuestion } from '../shared/models/quiz.model';
import { GeminiService } from './gemini.service';

export interface PyqFilter {
  year?: number | 'all';
  subject?: string | 'all';
  topic?: string | 'all';
  difficulty?: string | 'all';
  searchQuery?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PyqService {
  private readonly CACHE_STORAGE_KEY = 'tet_master_cached_pyq_v1';
  private questions: PreviousYearQuestion[] = [];

  constructor(private geminiService: GeminiService) {
    this.initDatabase();
  }

  private initDatabase(): void {
    try {
      const saved = localStorage.getItem(this.CACHE_STORAGE_KEY);
      if (saved) {
        const parsed: PreviousYearQuestion[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.questions = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached PYQ from localStorage:', e);
    }
  }

  private saveCachedQuestions(): void {
    try {
      localStorage.setItem(this.CACHE_STORAGE_KEY, JSON.stringify(this.questions.slice(0, 300)));
    } catch (e) {
      console.warn('Failed to save cached PYQ to localStorage:', e);
    }
  }

  /**
   * Fetch authentic Previous Year Questions directly from Gemini AI and cache them into the local database
   */
  public fetchPyqFromGemini(
    year: number | string = 2023,
    subject: string = 'all',
    count: number = 10,
    topic?: string,
    language: string = 'Bengali'
  ): Observable<PreviousYearQuestion[]> {
    return this.geminiService.generatePreviousYearQuestions(year, subject, count, topic, language).pipe(
      tap(newQuestions => {
        if (Array.isArray(newQuestions) && newQuestions.length > 0) {
          this.cacheQuestions(newQuestions);
        }
      })
    );
  }

  /**
   * Add and cache newly retrieved questions into the in-memory and offline store
   */
  public cacheQuestions(newQuestions: PreviousYearQuestion[]): void {
    let addedCount = 0;
    for (const item of newQuestions) {
      const exists = this.questions.some(
        q => q.question.trim().toLowerCase() === item.question.trim().toLowerCase()
      );
      if (!exists) {
        this.questions.unshift(item);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      this.saveCachedQuestions();
    }
  }

  /**
   * Get all previous year questions (built-in + AI generated)
   */
  public getAllQuestions(): Observable<PreviousYearQuestion[]> {
    return of([...this.questions]);
  }

  /**
   * Filter questions by year, subject, topic, difficulty, or search query
   */
  public filterQuestions(filter: PyqFilter): Observable<PreviousYearQuestion[]> {
    let result = [...this.questions];

    if (filter.year && filter.year !== 'all') {
      result = result.filter(q => q.year === filter.year);
    }

    if (filter.subject && filter.subject !== 'all') {
      result = result.filter(q => q.subject.toLowerCase() === filter.subject?.toLowerCase());
    }

    if (filter.topic && filter.topic !== 'all') {
      result = result.filter(q => q.topic.toLowerCase().includes((filter.topic as string).toLowerCase()));
    }

    if (filter.difficulty && filter.difficulty !== 'all') {
      result = result.filter(q => q.difficulty.toLowerCase() === filter.difficulty?.toLowerCase());
    }

    if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
      const q = filter.searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        item.question.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q)
      );
    }

    return of(result);
  }

  /**
   * Get available Years in the database
   */
  public getAvailableYears(): number[] {
    const defaultYears = [2023, 2022, 2021, 2017, 2015, 2014];
    const presentYears = this.questions.map(q => q.year);
    const set = new Set<number>([...defaultYears, ...presentYears]);
    return Array.from(set).sort((a, b) => b - a);
  }

  /**
   * Get available Topics for a given subject
   */
  public getTopicsBySubject(subject?: string): string[] {
    let pool = this.questions;
    if (subject && subject !== 'all') {
      pool = pool.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
    }
    const topics = Array.from(new Set(pool.map(q => q.topic)));
    return topics.filter(t => t && t.trim().length > 0);
  }
}
