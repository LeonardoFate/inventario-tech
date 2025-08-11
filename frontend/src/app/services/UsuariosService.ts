import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Usuario } from '../models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

getUsuarios(): Observable<Usuario[]> {
  return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`);
}

}