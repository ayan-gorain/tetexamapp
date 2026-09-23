import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizQuestion, TopicNote, TET_SUBJECTS } from '../../models/quiz.model';
import { GeminiService } from '../../../services/gemini.service';
import { StorageService } from '../../../services/storage.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-topic-study-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './topic-study-modal.component.html',
  styleUrl: './topic-study-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicStudyModalComponent implements OnChanges {
  @Input() public isOpen: boolean = false;
  @Input() public question: QuizQuestion | null = null;
  @Input() public initialNote: TopicNote | null = null;

  @Output() public close = new EventEmitter<void>();
  @Output() public practiceTopic = new EventEmitter<TopicNote>();

  public isLoading: boolean = false;
  public errorMessage: string = '';
  public note: TopicNote | null = null;
  public isSaved: boolean = false;
  public copyFeedback: boolean = false;
  public activeTab: 'all' | 'concept' | 'mnemonics' | 'traps' = 'all';

  constructor(
    private geminiService: GeminiService,
    private storageService: StorageService,
    private langService: LanguageService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isOpen) {
      if (changes['isOpen']?.currentValue === true || changes['question'] || changes['initialNote']) {
        this.handleModalOpen();
      }
    }
  }

  private handleModalOpen(): void {
    this.errorMessage = '';
    this.copyFeedback = false;
    this.activeTab = 'all';

    if (this.initialNote) {
      this.note = this.initialNote;
      this.isSaved = this.storageService.isTopicSaved(this.note.id, this.note.subject);
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    if (this.question) {
      this.generateNotesForQuestion(this.question);
    }
  }

  public generateNotesForQuestion(q: QuizQuestion): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.note = null;
    this.isSaved = false;
    this.cdr.detectChanges();

    const lang = this.langService.currentLanguage === 'en' ? 'English' : 'Bengali';

    this.geminiService.generateTopicStudyNotes(q, lang).subscribe({
      next: (generatedNote) => {
        this.ngZone.run(() => {
          this.note = generatedNote;
          this.isSaved = this.storageService.isTopicSaved(generatedNote.id, generatedNote.subject);
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: Error) => {
        this.ngZone.run(() => {
          this.errorMessage = err.message || 'Gemini API was unable to generate topic notes. Please retry.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  public retryGeneration(): void {
    if (this.question) {
      this.generateNotesForQuestion(this.question);
    }
  }

  public toggleSave(): void {
    if (!this.note) return;

    if (!this.isSaved) {
      this.storageService.saveTopicNote(this.note);
      this.isSaved = true;
      this.cdr.markForCheck();
    }
  }

  public copyNotesToClipboard(): void {
    if (!this.note) return;

    const formatted = `
📚 ${this.note.topicTitle} [${this.note.subject}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 মূল ধারণা (Core Concept):
${this.note.coreConcept}

📌 গুরুত্বপূর্ণ নিয়ম ও শিক্ষাতত্ত্ব (Key Points):
${this.note.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

${this.note.memoryMnemonics ? `🧠 মনে রাখার শর্টকাট ট্রিকস (Mnemonics):\n${this.note.memoryMnemonics}\n` : ''}
${this.note.realLifeExample ? `💡 বাস্তব প্রয়োগ ও শ্রেণিকক্ষ উদাহরণ (Example):\n${this.note.realLifeExample}\n` : ''}
${this.note.commonMistakes && this.note.commonMistakes.length > 0 ? `⚠️ পরীক্ষায় সাধারণ ভুল (Mistakes to Avoid):\n${this.note.commonMistakes.map(m => `• ${m}`).join('\n')}\n` : ''}
${this.note.examTakeaways && this.note.examTakeaways.length > 0 ? `📝 দ্রুত রিভিশন পয়েন্টস (Revision Takeaways):\n${this.note.examTakeaways.map(t => `• ${t}`).join('\n')}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TET Master Study Vault
    `.trim();

    navigator.clipboard.writeText(formatted).then(() => {
      this.copyFeedback = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.copyFeedback = false;
        this.cdr.markForCheck();
      }, 2500);
    }).catch(() => {
      // fallback
    });
  }

  public onPracticeClick(): void {
    if (this.note) {
      this.practiceTopic.emit(this.note);
      this.closeModal();
    }
  }

  public closeModal(): void {
    this.close.emit();
  }

  public getSubjectDisplayName(subId: string): string {
    const found = TET_SUBJECTS.find(s => s.id.toLowerCase() === subId.toLowerCase());
    if (!found) return subId;
    return this.langService.currentLanguage === 'en' ? found.nameEn : found.nameBn;
  }

  public getSubjectIcon(subId?: string): string {
    if (!subId) return 'bi bi-book-half';
    const found = TET_SUBJECTS.find(s => s.id.toLowerCase() === subId.toLowerCase());
    return found ? `bi ${found.icon}` : 'bi bi-book-half';
  }
}
