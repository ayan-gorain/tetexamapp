import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { User } from 'firebase/auth';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { LanguageService, AppLanguage } from './services/language.service';
import { TranslatePipe } from './shared/pipes/translate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'TET Master';
  public currentUser: User | null = null;
  public isAuthLoading: boolean = true;
  public isSigningIn: boolean = false;
  public authError: string = '';
  public currentLang: AppLanguage = 'bn';

  constructor(
    private authService: AuthService,
    private langService: LanguageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Synchronously check if user is already cached
    this.currentUser = this.authService.currentUser;
    this.currentLang = this.langService.currentLanguage;

    this.authService.user$.subscribe(user => {
      const wasLoggedOut = !this.currentUser;
      this.currentUser = user;
      this.isSigningIn = false;
      this.cdr.detectChanges();

      // When user logs in or session restores, ensure the router outlet activates current route
      if (user && wasLoggedOut) {
        const targetUrl = (this.router.url === '/' || !this.router.url) ? '/dashboard' : this.router.url;
        this.router.navigateByUrl(targetUrl).then(() => {
          this.cdr.detectChanges();
        });
      }
    });

    this.authService.isAuthLoading$.subscribe(loading => {
      this.isAuthLoading = loading;
      this.cdr.detectChanges();
    });

    this.authService.authError$.subscribe(err => {
      this.authError = err;
      this.isSigningIn = false;
      this.cdr.detectChanges();
    });

    this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.detectChanges();
    });
  }

  public async loginWithGoogle(): Promise<void> {
    this.isSigningIn = true;
    this.authError = '';
    this.cdr.detectChanges();
    await this.authService.loginWithGoogle();
    this.isSigningIn = false;
    this.cdr.detectChanges();
  }

  public setLanguage(lang: AppLanguage): void {
    this.langService.setLanguage(lang);
    this.cdr.detectChanges();
  }
}



