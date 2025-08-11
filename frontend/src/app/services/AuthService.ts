import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  setupAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/setup`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  changePassword(data: any, token: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/change-password`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getProfile(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  logout(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}