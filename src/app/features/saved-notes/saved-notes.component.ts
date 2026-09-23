import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TopicNote, TET_SUBJECTS } from '../../shared/models/quiz.model';
import { StorageService } from '../../services/storage.service';
import { GeminiService } from '../../services/gemini.service';
import { QuizService } from '../../services/quiz.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TopicStudyModalComponent } from '../../shared/components/topic-study-modal/topic-study-modal.component';

@Component({
  selector: 'app-saved-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe, TopicStudyModalComponent],
  templateUrl: './saved-notes.component.html',
  styleUrl: './saved-notes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavedNotesComponent implements OnInit, OnDestroy {
  public savedNotes: TopicNote[] = [];
  public selectedSubject: string = 'all';
  public searchQuery: string = '';
  public expandedNoteIds: { [noteId: string]: boolean } = {};
  
  public selectedNoteForModal: TopicNote | null = null;
  public isStudyModalOpen: boolean = false;
  
  public isGeneratingQuizForNoteId: string = '';
  public quizErrorMessage: string = '';
  public copiedNoteId: string = '';

  public readonly subjects = TET_SUBJECTS;
  private subs: Subscription = new Subscription();

  constructor(
    private storageService: StorageService,
    private geminiService: GeminiService,
    private quizService: QuizService,
    private langService: LanguageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.storageService.savedNotes$.subscribe(notes => {
        this.savedNotes = notes || [];
        this.cdr.markForCheck();
      })
    );

    this.subs.add(
      this.langService.currentLang$.subscribe(() => {
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public get filteredNotes(): TopicNote[] {
    let list = this.savedNotes;

    if (this.selectedSubject !== 'all') {
      list = list.filter(n => n.subject.toLowerCase() === this.selectedSubject.toLowerCase());
    }

    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(n => 
        n.topicTitle.toLowerCase().includes(q) ||
        n.coreConcept.toLowerCase().includes(q) ||
        (n.memoryMnemonics && n.memoryMnemonics.toLowerCase().includes(q)) ||
        (n.keyPoints && n.keyPoints.some(kp => kp.toLowerCase().includes(q))) ||
        (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }

  public getSubjectNoteCount(subId: string): number {
    if (subId === 'all') return this.savedNotes.length;
    return this.savedNotes.filter(n => n.subject.toLowerCase() === subId.toLowerCase()).length;
  }

  public toggleExpand(noteId: string): void {
    this.expandedNoteIds[noteId] = !this.expandedNoteIds[noteId];
    this.cdr.markForCheck();
  }

  public isExpanded(noteId: string): boolean {
    return !!this.expandedNoteIds[noteId];
  }

  public openFullStudyModal(note: TopicNote): void {
    this.selectedNoteForModal = note;
    this.isStudyModalOpen = true;
    this.cdr.markForCheck();
  }

  public closeStudyModal(): void {
    this.isStudyModalOpen = false;
    this.selectedNoteForModal = null;
    this.cdr.markForCheck();
  }

  public startPracticeQuiz(note: TopicNote): void {
    this.isGeneratingQuizForNoteId = note.id;
    this.quizErrorMessage = '';
    this.cdr.markForCheck();

    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';

    this.geminiService.generateQuizFromTopicNote(note, 10, lang).subscribe({
      next: (quizResponse) => {
        this.isGeneratingQuizForNoteId = '';
        this.cdr.markForCheck();
        this.quizService.startQuiz(quizResponse, {
          quizType: 'subject',
          subject: note.subject,
          numberOfQuestions: 10,
          difficulty: 'Medium',
          language: lang as any,
          mode: 'practice'
        });
      },
      error: (err: Error) => {
        this.isGeneratingQuizForNoteId = '';
        this.quizErrorMessage = err.message || 'Gemini API was unable to generate quiz questions for this topic.';
        this.cdr.markForCheck();
      }
    });
  }

  public deleteNote(noteId: string, event: Event): void {
    event.stopPropagation();
    const confirmMsg = this.langService.translate('notes.confirmDelete');
    if (window.confirm(confirmMsg)) {
      this.storageService.deleteTopicNote(noteId);
      this.cdr.markForCheck();
    }
  }

  public copyNoteText(note: TopicNote, event: Event): void {
    event.stopPropagation();
    const formatted = `
📚 ${note.topicTitle} [${note.subject}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 মূল ধারণা:
${note.coreConcept}

📌 মূল নিয়ম ও শিক্ষাতত্ত্ব:
${note.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

${note.memoryMnemonics ? `🧠 মনে রাখার কৌশল (Mnemonics):\n${note.memoryMnemonics}\n` : ''}
${note.realLifeExample ? `💡 বাস্তব উদাহরণ:\n${note.realLifeExample}\n` : ''}
${note.commonMistakes && note.commonMistakes.length > 0 ? `⚠️ পরীক্ষায় সাধারণ ভুল:\n${note.commonMistakes.map(m => `• ${m}`).join('\n')}\n` : ''}
${note.examTakeaways && note.examTakeaways.length > 0 ? `📝 রিভিশন পয়েন্টস:\n${note.examTakeaways.map(t => `• ${t}`).join('\n')}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TET Master Study Vault
    `.trim();

    navigator.clipboard.writeText(formatted).then(() => {
      this.copiedNoteId = note.id;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.copiedNoteId = '';
        this.cdr.markForCheck();
      }, 2000);
    });
  }

  public formatDate(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(this.langService.currentLanguage === 'bn' ? 'bn-IN' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  }

  public getSubjectDisplayName(subId: string): string {
    const found = TET_SUBJECTS.find(s => s.id.toLowerCase() === subId.toLowerCase());
    if (!found) return subId;
    return this.langService.currentLanguage === 'en' ? found.nameEn : found.nameBn;
  }
}
