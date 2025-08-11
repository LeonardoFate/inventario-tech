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
    console.log('🔐 AuthService - Iniciando login con:', credentials.nombreUsuario);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('🔐 AuthService - Respuesta de login completa:', response);
          console.log('🔐 AuthService - Usuario en respuesta:', response.usuario);
          
          if (response.token) {
            // Normalizar el usuario para asegurar que tenga la estructura correcta
            const normalizedUser = this.normalizeUser(response.usuario);
            console.log('🔐 AuthService - Usuario normalizado:', normalizedUser);
            
            this.setSession(response.token, normalizedUser);
          }
        }),
        catchError(error => {
          console.error('🔐 AuthService - Error en login:', error);
          throw error;
        })
      );
  }

  getProfile(): Observable<{ usuario: Usuario }> {
    return this.http.get<{ usuario: Usuario }>(`${this.API_URL}/auth/profile`)
      .pipe(
        tap(response => {
          console.log('🔐 AuthService - Perfil obtenido:', response.usuario);
          const normalizedUser = this.normalizeUser(response.usuario);
          this.currentUserSubject.next(normalizedUser);
          localStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
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

  private normalizeUser(user: any): Usuario {
    console.log('🔧 AuthService - Normalizando usuario:', user);
    
    // El backend puede enviar el usuario con diferentes estructuras
    // Vamos a normalizar para asegurar consistencia
    const normalized: Usuario = {
      usuarioId: user.UsuarioID || user.usuarioId,
      UsuarioID: user.UsuarioID || user.usuarioId,
      nombreUsuario: user.NombreUsuario || user.nombreUsuario,
      email: user.Email || user.email,
      nombres: user.Nombres || user.nombres,
      apellidos: user.Apellidos || user.apellidos,
      cedula: user.Cedula || user.cedula,
      rol: user.Rol || user.rol || 'Empleado', // Fallback a 'Empleado' si no hay rol
      departamento: user.Departamento || user.departamento,
      ubicacionId: user.UbicacionID || user.ubicacionId
    };
    
    console.log('🔧 AuthService - Usuario normalizado resultado:', normalized);
    return normalized;
  }

  private setSession(token: string, user: Usuario): void {
    console.log('🔐 AuthService - Guardando sesión:', { token: token.substring(0, 20) + '...', user });
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.isLoggedInSubject.next(true);
    this.currentUserSubject.next(user);
  }

  private clearSession(): void {
    console.log('🔐 AuthService - Limpiando sesión');
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
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('🔐 AuthService - Usuario desde storage:', user);
        return this.normalizeUser(user);
      } catch (error) {
        console.error('🔐 AuthService - Error parseando usuario desde storage:', error);
        return null;
      }
    }
    return null;
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
      const isValid = payload.exp > currentTime;
      console.log('🔐 AuthService - Token válido:', isValid, 'Expira:', new Date(payload.exp * 1000));
      return isValid;
    } catch {
      console.log('🔐 AuthService - Error verificando token');
      return false;
    }
  }

  getCurrentUser(): Usuario | null {
    const user = this.currentUserSubject.value;
    console.log('🔐 AuthService - getCurrentUser devuelve:', user);
    return user;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    console.log('🔐 AuthService - Verificando roles:', { userRole: user?.rol, requiredRoles: roles });
    
    if (!user || !user.rol) {
      console.log('🔐 AuthService - No hay usuario o rol');
      return false;
    }
    
    const hasAccess = roles.includes(user.rol);
    console.log('🔐 AuthService - Tiene acceso:', hasAccess);
    return hasAccess;
  }

  private checkTokenValidity(): void {
    if (this.hasToken() && !this.isAuthenticated()) {
      console.log('🔐 AuthService - Token inválido, limpiando sesión');
      this.clearSession();
    }
  }
}