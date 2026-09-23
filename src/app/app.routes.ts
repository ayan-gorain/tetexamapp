import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { QuizScreenComponent } from './features/quiz-screen/quiz-screen.component';
import { ResultComponent } from './features/result/result.component';
import { ReviewComponent } from './features/review/review.component';
import { PreviousYearComponent } from './features/previous-year/previous-year.component';
import { SavedNotesComponent } from './features/saved-notes/saved-notes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard | TET Master' },
  { path: 'quiz', component: QuizScreenComponent, title: 'Live Quiz | TET Master' },
  { path: 'results', component: ResultComponent, title: 'Results | TET Master' },
  { path: 'review', component: ReviewComponent, title: 'Review Answers | TET Master' },
  { path: 'saved-notes', component: SavedNotesComponent, title: 'Study Vault & Notes | TET Master' },
  { path: 'previous-year', component: PreviousYearComponent, title: 'Previous Year Papers | TET Master' },
  { path: '**', redirectTo: 'dashboard' }
];

