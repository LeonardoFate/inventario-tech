import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catalogos/categorias`);
  }

  getMarcas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catalogos/marcas`);
  }

  getUbicaciones(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catalogos/ubicaciones`);
  }

  getProveedores(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catalogos/proveedores`);
  }

  crearCategoria(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/catalogos/categorias`, data);
  }

  crearMarca(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/catalogos/marcas`, data);
  }
}