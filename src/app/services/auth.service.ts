import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth | null = null;
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(true);
  public isAuthLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string>('');
  public authError$: Observable<string> = this.errorSubject.asObservable();

  constructor() {
    this.initFirebase();
  }

  private async initFirebase(): Promise<void> {
    try {
      if (!environment.firebase || !environment.firebase.apiKey) {
        console.warn('Firebase configuration is missing or incomplete.');
        this.loadingSubject.next(false);
        return;
      }

      const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
      this.auth = getAuth(app);

      // Initialize analytics safely if supported in current browser environment
      try {
        const analyticsSupported = await isSupported();
        if (analyticsSupported) {
          getAnalytics(app);
        }
      } catch (err) {
        console.debug('Firebase Analytics initialization skipped:', err);
      }

      // Listen to auth state changes
      onAuthStateChanged(this.auth, (user: User | null) => {
        this.userSubject.next(user);
        this.loadingSubject.next(false);
      });
    } catch (error) {
      console.error('Error initializing Firebase Auth:', error);
      this.loadingSubject.next(false);
    }
  }

  public get currentUser(): User | null {
    return this.userSubject.getValue();
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  public get displayName(): string {
    return this.currentUser?.displayName || 'User';
  }

  public get photoURL(): string {
    return this.currentUser?.photoURL || '';
  }

  public get email(): string {
    return this.currentUser?.email || '';
  }

  /**
   * Sign in using Google Auth Provider.
   * Uses popup with automatic fallback to redirect on mobile devices.
   */
  public async loginWithGoogle(): Promise<User | null> {
    if (!this.auth) {
      this.errorSubject.next('Firebase Auth is not initialized');
      return null;
    }

    this.errorSubject.next('');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(this.auth, provider);
      this.userSubject.next(result.user);
      return result.user;
    } catch (error: any) {
      console.warn('Google Sign-In popup failed, trying redirect:', error);
      
      // If popup was blocked or closed, try redirect
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(this.auth, provider);
          return null;
        } catch (redirectError: any) {
          console.error('Google Sign-In redirect failed:', redirectError);
          this.errorSubject.next(redirectError.message || 'Google Login failed');
          return null;
        }
      }

      this.errorSubject.next(error.message || 'Failed to sign in with Google');
      return null;
    }
  }

  /**
   * Sign out the current user.
   */
  public async logout(): Promise<void> {
    if (!this.auth) return;

    try {
      await signOut(this.auth);
      this.userSubject.next(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      this.errorSubject.next(error.message || 'Failed to sign out');
    }
  }
}
