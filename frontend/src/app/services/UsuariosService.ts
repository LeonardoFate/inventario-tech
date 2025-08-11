// frontend/src/app/services/UsuariosService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { Usuario } from '../models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`).pipe(
      catchError(this.handleError)
    );
  }

  crearUsuario(usuario: Partial<Usuario>): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, usuario).pipe(
      catchError(this.handleError)
    );
  }

  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/${id}`, usuario).pipe(
      catchError(this.handleError)
    );
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/usuarios/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  cambiarPassword(id: number, passwordData: { passwordActual: string, passwordNuevo: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/${id}/password`, passwordData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError = (error: any) => {
    console.error('Error en UsuariosService:', error);
    return throwError(() => error);
  }
}