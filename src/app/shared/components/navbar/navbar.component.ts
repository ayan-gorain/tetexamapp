import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from 'firebase/auth';
import { StorageService } from '../../../services/storage.service';
import { LanguageService, AppLanguage } from '../../../services/language.service';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  public currentStreak: number = 1;
  public currentLang: AppLanguage = 'bn';
  public currentUser: User | null = null;
  public isAuthLoading: boolean = false;
  public showProfileMenu: boolean = false;

  constructor(
    private storageService: StorageService,
    private langService: LanguageService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.currentStreak = this.storageService.getUserStats().currentStreak || 1;
    this.currentLang = this.langService.currentLanguage;
    this.currentUser = this.authService.currentUser;

    this.storageService.stats$.subscribe(stats => {
      this.currentStreak = stats.currentStreak || 1;
      this.cdr.markForCheck();
    });

    this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.markForCheck();
    });

    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });

    this.authService.isAuthLoading$.subscribe(loading => {
      this.isAuthLoading = loading;
      this.cdr.markForCheck();
    });

    this.cdr.detectChanges();
  }


  public setLanguage(lang: AppLanguage): void {
    this.langService.setLanguage(lang);
    this.cdr.markForCheck();
  }

  public toggleLanguage(): void {
    this.langService.toggleLanguage();
    this.cdr.markForCheck();
  }

  public async loginWithGoogle(): Promise<void> {
    await this.authService.loginWithGoogle();
    this.cdr.markForCheck();
  }

  public toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.cdr.markForCheck();
  }

  public closeProfileMenu(): void {
    this.showProfileMenu = false;
    this.cdr.markForCheck();
  }

  public async logout(): Promise<void> {
    this.showProfileMenu = false;
    await this.authService.logout();
    this.cdr.markForCheck();
  }
}

