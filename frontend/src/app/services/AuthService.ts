import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, AuthResponse, Usuario } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());

  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkTokenValidity();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setSession(response.token, response.usuario);
          }
        }),
        catchError(error => {
          console.error('Error en login:', error);
          throw error;
        })
      );
  }

  getProfile(): Observable<{ usuario: Usuario }> {
    return this.http.get<{ usuario: Usuario }>(`${this.API_URL}/auth/profile`)
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.usuario);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/logout`, {})
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of(null);
        })
      );
  }

  private setSession(token: string, user: Usuario): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.isLoggedInSubject.next(true);
    this.currentUserSubject.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private getUserFromStorage(): Usuario | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.rol) : false;
  }

  private checkTokenValidity(): void {
    if (this.hasToken() && !this.isAuthenticated()) {
      this.clearSession();
    }
  }
}