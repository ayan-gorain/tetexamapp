import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PreviousYearQuestion } from '../shared/models/quiz.model';
import { PYQ_DATABASE } from '../core/data/pyq-questions.data';

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
  private questions: PreviousYearQuestion[] = PYQ_DATABASE;

  constructor() {}

  /**
   * Get all previous year questions
   */
  public getAllQuestions(): Observable<PreviousYearQuestion[]> {
    return of(this.questions);
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
    const years = Array.from(new Set(this.questions.map(q => q.year)));
    return years.sort((a, b) => b - a);
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
    return topics.filter(t => t && t.length > 0);
  }
}
