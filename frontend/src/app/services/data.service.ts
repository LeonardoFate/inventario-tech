import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Dispositivo, Categoria, Marca, Ubicacion, Proveedor, Estadisticas } from '../models';
import { tap } from 'rxjs/operators';
import { Usuario } from '../models';
import { UsuariosService } from './UsuariosService';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly API_URL = environment.apiUrl;

constructor(
  private http: HttpClient,
  private usuariosService: UsuariosService
) {
  console.log('DataService inicializado con API_URL:', this.API_URL);
}


getUsuarios(): Observable<Usuario[]> {
  const url = `${this.API_URL}/usuarios`;
  console.log('Llamando a getUsuarios:', url);
  
  return this.usuariosService.getUsuarios().pipe(
    catchError(this.handleError)
  );
}


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
    
    const url = `${this.API_URL}/dispositivos`;
    console.log('Llamando a getDispositivos:', url, httpParams.toString());
    
    return this.http.get(url, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

getDispositivo(id: number): Observable<any> {
  const url = `${this.API_URL}/dispositivos/${id}`;
  console.log('🔍 DataService - Llamando a getDispositivo:', url);
  
  return this.http.get<any>(url).pipe(
    tap((response: any) => {
      console.log('✅ DataService - Respuesta getDispositivo:', response);
      console.log('📄 Estructura del dispositivo:', response?.dispositivo ? Object.keys(response.dispositivo) : 'Sin dispositivo');
    }),
    catchError(error => {
      console.error('❌ DataService - Error getDispositivo:', error);
      console.error('📄 Error status:', error.status);
      console.error('📄 Error message:', error.message);
      console.error('📄 Error completo:', error);
      return this.handleError(error);
    })
  );
}


  crearDispositivo(dispositivo: Partial<Dispositivo>): Observable<any> {
    const url = `${this.API_URL}/dispositivos`;
    console.log('Llamando a crearDispositivo:', url, dispositivo);
    
    return this.http.post(url, dispositivo).pipe(
      catchError(this.handleError)
    );
  }

  actualizarDispositivo(id: number, dispositivo: Partial<Dispositivo>): Observable<any> {
    const url = `${this.API_URL}/dispositivos/${id}`;
    console.log('Llamando a actualizarDispositivo:', url, dispositivo);
    
    return this.http.put(url, dispositivo).pipe(
      catchError(this.handleError)
    );
  }

  eliminarDispositivo(id: number): Observable<any> {
    const url = `${this.API_URL}/dispositivos/${id}`;
    console.log('Llamando a eliminarDispositivo:', url);
    
    return this.http.delete(url).pipe(
      catchError(this.handleError)
    );
  }

  getEstadisticas(): Observable<Estadisticas> {
    const url = `${this.API_URL}/dispositivos/estadisticas`;
    console.log('Llamando a getEstadisticas:', url);
    
    return this.http.get<Estadisticas>(url).pipe(
      catchError(this.handleError)
    );
  }

  // Catálogos
  getCategorias(): Observable<{ categorias: Categoria[] }> {
    const url = `${this.API_URL}/catalogos/categorias`;
    console.log('Llamando a getCategorias:', url);
    
    return this.http.get<{ categorias: Categoria[] }>(url).pipe(
      catchError(this.handleError)
    );
  }

  getMarcas(): Observable<{ marcas: Marca[] }> {
    const url = `${this.API_URL}/catalogos/marcas`;
    console.log('Llamando a getMarcas:', url);
    
    return this.http.get<{ marcas: Marca[] }>(url).pipe(
      catchError(this.handleError)
    );
  }

  getUbicaciones(): Observable<{ ubicaciones: Ubicacion[] }> {
    const url = `${this.API_URL}/catalogos/ubicaciones`;
    console.log('Llamando a getUbicaciones:', url);
    
    return this.http.get<{ ubicaciones: Ubicacion[] }>(url).pipe(
      catchError(this.handleError)
    );
  }

  getProveedores(): Observable<{ proveedores: Proveedor[] }> {
    const url = `${this.API_URL}/catalogos/proveedores`;
    console.log('Llamando a getProveedores:', url);
    
    return this.http.get<{ proveedores: Proveedor[] }>(url).pipe(
      catchError(this.handleError)
    );
  }

  crearCategoria(categoria: { nombreCategoria: string; descripcion?: string }): Observable<any> {
    const url = `${this.API_URL}/catalogos/categorias`;
    console.log('Llamando a crearCategoria:', url, categoria);
    
    return this.http.post(url, categoria).pipe(
      catchError(this.handleError)
    );
  }

  crearMarca(marca: { nombreMarca: string; descripcion?: string }): Observable<any> {
    const url = `${this.API_URL}/catalogos/marcas`;
    console.log('Llamando a crearMarca:', url, marca);
    
    return this.http.post(url, marca).pipe(
      catchError(this.handleError)
    );
  }

  // Archivos
  subirArchivos(dispositivoId: number, formData: FormData): Observable<any> {
    const url = `${this.API_URL}/dispositivos/${dispositivoId}/archivos`;
    console.log('Llamando a subirArchivos:', url);
    
    return this.http.post(url, formData).pipe(
      catchError(this.handleError)
    );
  }

  eliminarArchivo(dispositivoId: number, archivoId: number): Observable<any> {
    const url = `${this.API_URL}/dispositivos/${dispositivoId}/archivos/${archivoId}`;
    console.log('Llamando a eliminarArchivo:', url);
    
    return this.http.delete(url).pipe(
      catchError(this.handleError)
    );
  }

  // Método para manejar errores
  private handleError = (error: HttpErrorResponse) => {
    console.error('Error en DataService:', error);
    
    let errorMessage = 'Ha ocurrido un error';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
    }
    
    console.error('Mensaje de error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Método de prueba para verificar conectividad
  testConnection(): Observable<any> {
    const url = `${this.API_URL}/test`;
    console.log('Probando conexión:', url);
    
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }
}