import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ArchivosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  subirArchivos(deviceId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/dispositivos/${deviceId}/archivos`, formData);
  }

  eliminarArchivo(deviceId: string, archivoId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/dispositivos/${deviceId}/archivos/${archivoId}`);
  }
}