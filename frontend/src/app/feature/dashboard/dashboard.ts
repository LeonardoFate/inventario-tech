import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/AuthService';
import { Estadisticas, Usuario } from '../../models/index';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  estadisticas: Estadisticas | null = null;
  usuario: Usuario | null = null;
  loading = true;
  error = '';
  
  // Variables de debug
  debugInfo = {
    apiUrl: '',
    token: '',
    userInfo: '',
    lastResponse: '',
    requestCount: 0
  };

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('🚀 Dashboard ngOnInit iniciado');
    
    // Debug info
    this.debugInfo.apiUrl = 'http://localhost:3000/api';
    this.debugInfo.token = this.authService.getToken()?.substring(0, 50) + '...' || 'No token';
    
    this.usuario = this.authService.getCurrentUser();
    this.debugInfo.userInfo = this.usuario ? `${this.usuario.nombres} (${this.usuario.rol})` : 'No user';
    
    console.log('👤 Usuario actual:', this.usuario);
    console.log('🔑 Token:', this.debugInfo.token);
    
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    console.log('📊 Iniciando carga de estadísticas...');
    this.debugInfo.requestCount++;
    
    this.loading = true;
    this.error = '';
    
    // Llamar al servicio
    this.dataService.getEstadisticas().subscribe({
      next: (data) => {
        console.log('✅ Estadísticas recibidas - RESPUESTA COMPLETA:', data);
        console.log('📈 Tipo de datos:', typeof data);
        console.log('🔍 Propiedades del objeto:', Object.keys(data || {}));
        
        // Verificar estructura de datos
        if (data) {
          console.log('📊 General:', data.general);
          console.log('📂 Por Categoría:', data.porCategoria);
          console.log('🏷️ Por Marca:', data.porMarca);
          console.log('📍 Por Ubicación:', data.porUbicacion);
        }
        
        this.estadisticas = data;
        this.debugInfo.lastResponse = JSON.stringify(data, null, 2).substring(0, 500) + '...';
        this.loading = false;
        
        console.log('✅ Estado actualizado - loading:', this.loading, 'estadisticas:', !!this.estadisticas);
      },
      error: (error) => {
        console.error('❌ ERROR cargando estadísticas:', error);
        console.error('🔍 Tipo de error:', typeof error);
        console.error('📄 Error completo:', JSON.stringify(error, null, 2));
        
        this.error = 'Error cargando estadísticas: ' + (error.message || 'Error desconocido');
        this.debugInfo.lastResponse = 'ERROR: ' + error.message;
        this.loading = false;
      },
      complete: () => {
        console.log('🏁 Observable completado');
      }
    });
  }

  // Método para verificar conectividad básica
  testConnection() {
    console.log('🔄 Probando conexión...');
    
    // Probar endpoint de test
    this.dataService.getDispositivos({ limite: 1 }).subscribe({
      next: (data) => {
        console.log('✅ Test de conexión exitoso:', data);
        alert('Conexión exitosa con el backend');
      },
      error: (error) => {
        console.error('❌ Test de conexión falló:', error);
        alert('Error de conexión: ' + error.message);
      }
    });
  }

  // Método para verificar el token
  checkToken() {
    const token = this.authService.getToken();
    console.log('🔑 Token completo:', token);
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📋 Payload del token:', payload);
        console.log('⏰ Expira en:', new Date(payload.exp * 1000));
        console.log('👤 Usuario del token:', payload.usuarioId);
      } catch (e) {
        console.error('❌ Error decodificando token:', e);
      }
    }
  }

  // Método para forzar reload
  forceReload() {
    console.log('🔄 Forzando recarga completa...');
    this.estadisticas = null;
    this.loading = true;
    this.error = '';
    
    // Esperar un momento y recargar
    setTimeout(() => {
      this.cargarEstadisticas();
    }, 500);
  }

  // Getter para debug
  get debugData() {
    return {
      ...this.debugInfo,
      estadisticasPresent: !!this.estadisticas,
      loading: this.loading,
      error: this.error,
      currentTime: new Date().toISOString()
    };
  }
}