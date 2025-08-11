import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Dispositivo, Categoria, Marca, Ubicacion, Proveedor, Estadisticas } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Dispositivos
  getDispositivos(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.API_URL}/dispositivos`, { params: httpParams });
  }

  getDispositivo(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/dispositivos/${id}`);
  }

  crearDispositivo(dispositivo: Partial<Dispositivo>): Observable<any> {
    return this.http.post(`${this.API_URL}/dispositivos`, dispositivo);
  }

  actualizarDispositivo(id: number, dispositivo: Partial<Dispositivo>): Observable<any> {
    return this.http.put(`${this.API_URL}/dispositivos/${id}`, dispositivo);
  }

  eliminarDispositivo(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/dispositivos/${id}`);
  }

  getEstadisticas(): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(`${this.API_URL}/dispositivos/estadisticas`);
  }

  // Catálogos
  getCategorias(): Observable<{ categorias: Categoria[] }> {
    return this.http.get<{ categorias: Categoria[] }>(`${this.API_URL}/catalogos/categorias`);
  }

  getMarcas(): Observable<{ marcas: Marca[] }> {
    return this.http.get<{ marcas: Marca[] }>(`${this.API_URL}/catalogos/marcas`);
  }

  getUbicaciones(): Observable<{ ubicaciones: Ubicacion[] }> {
    return this.http.get<{ ubicaciones: Ubicacion[] }>(`${this.API_URL}/catalogos/ubicaciones`);
  }

  getProveedores(): Observable<{ proveedores: Proveedor[] }> {
    return this.http.get<{ proveedores: Proveedor[] }>(`${this.API_URL}/catalogos/proveedores`);
  }

  crearCategoria(categoria: { nombreCategoria: string; descripcion?: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/catalogos/categorias`, categoria);
  }

  crearMarca(marca: { nombreMarca: string; descripcion?: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/catalogos/marcas`, marca);
  }

  // Archivos
  subirArchivos(dispositivoId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/dispositivos/${dispositivoId}/archivos`, formData);
  }

  eliminarArchivo(dispositivoId: number, archivoId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/dispositivos/${dispositivoId}/archivos/${archivoId}`);
  }
}