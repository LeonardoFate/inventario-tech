import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DispositivosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTodos(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/dispositivos`, { params });
  }

  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dispositivos/estadisticas`);
  }

  getPorId(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/dispositivos/${id}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/dispositivos`, data);
  }

  actualizar(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/dispositivos/${id}`, data);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/dispositivos/${id}`);
  }
}