import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/AuthService';
import { environment } from '../../../environments/environment';

interface DispositivoDetalle {
  dispositivo: any;
  archivos: any[];
  historial: any[];
}

@Component({
  selector: 'app-dispositivo-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="detalle-container">
      <div class="header-actions">
        <button (click)="volver()" class="btn btn-outline">
          ← Volver a Dispositivos
        </button>
        <div class="actions" *ngIf="dispositivo">
          <button *ngIf="esTecnicoOSuperior" (click)="editarDispositivo()" 
                  class="btn btn-warning">Editar</button>
          <button *ngIf="esTecnicoOSuperior" (click)="subirArchivos()" 
                  class="btn btn-success">Subir Archivos</button>
          <button *ngIf="esAdmin" (click)="eliminarDispositivo()" 
                  class="btn btn-danger">Eliminar</button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        Cargando información del dispositivo...
      </div>

      <div *ngIf="error" class="error">
        {{ error }}
      </div>

      <div *ngIf="dispositivo && !loading" class="dispositivo-detalle">
        <!-- Información básica -->
        <div class="card">
          <div class="card-header">
            <h2>{{ dispositivo.nombreDispositivo }}</h2>
            <div class="badges">
              <span class="badge" [ngClass]="getEstadoClass(dispositivo.estado)">
                {{ dispositivo.estado }}
              </span>
              <span class="badge" [ngClass]="getCondicionClass(dispositivo.condicion)">
                {{ dispositivo.condicion }}
              </span>
              <span class="badge" [ngClass]="getGarantiaClass(dispositivo.estadoGarantia)">
                Garantía: {{ dispositivo.estadoGarantia }}
              </span>
            </div>
          </div>
          
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <label>Código:</label>
                <span>{{ dispositivo.codigoDispositivo }}</span>
              </div>
              <div class="info-item">
                <label>Categoría:</label>
                <span>{{ dispositivo.nombreCategoria }}</span>
              </div>
              <div class="info-item">
                <label>Marca:</label>
                <span>{{ dispositivo.nombreMarca }}</span>
              </div>
              <div class="info-item">
                <label>Modelo:</label>
                <span>{{ dispositivo.modelo }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.numeroSerie">
                <label>Número de Serie:</label>
                <span>{{ dispositivo.numeroSerie }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.numeroParte">
                <label>Número de Parte:</label>
                <span>{{ dispositivo.numeroParte }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.nombreUbicacion">
                <label>Ubicación:</label>
                <span>{{ dispositivo.nombreUbicacion }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.nombreProveedor">
                <label>Proveedor:</label>
                <span>{{ dispositivo.nombreProveedor }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Especificaciones técnicas -->
        <div class="card" *ngIf="tieneEspecificaciones()">
          <div class="card-header">
            <h3>Especificaciones Técnicas</h3>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item" *ngIf="dispositivo.procesador">
                <label>Procesador:</label>
                <span>{{ dispositivo.procesador }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.memoriaRAM">
                <label>Memoria RAM:</label>
                <span>{{ dispositivo.memoriaRAM }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.almacenamiento">
                <label>Almacenamiento:</label>
                <span>{{ dispositivo.almacenamiento }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.sistemaOperativo">
                <label>Sistema Operativo:</label>
                <span>{{ dispositivo.sistemaOperativo }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.versionSO">
                <label>Versión SO:</label>
                <span>{{ dispositivo.versionSO }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Información de compra y garantía -->
        <div class="card" *ngIf="tieneInfoCompra()">
          <div class="card-header">
            <h3>Información de Compra y Garantía</h3>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item" *ngIf="dispositivo.fechaCompra">
                <label>Fecha de Compra:</label>
                <span>{{ dispositivo.fechaCompra | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.precioCompra">
                <label>Precio de Compra:</label>
                <span>\${{ dispositivo.precioCompra | number:'1.2-2' }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.vencimientoGarantia">
                <label>Vencimiento Garantía:</label>
                <span>{{ dispositivo.vencimientoGarantia | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item" *ngIf="dispositivo.numeroFactura">
                <label>Número de Factura:</label>
                <span>{{ dispositivo.numeroFactura }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Archivos adjuntos -->
        <div class="card">
          <div class="card-header">
            <h3>Archivos Adjuntos ({{ archivos.length }})</h3>
            <button *ngIf="esTecnicoOSuperior" (click)="subirArchivos()" 
                    class="btn btn-sm btn-primary">Subir Archivo</button>
          </div>
          <div class="card-body">
            <div *ngIf="archivos.length === 0" class="no-data">
              No hay archivos adjuntos
            </div>
            <div *ngIf="archivos.length > 0" class="archivos-lista">
              <div *ngFor="let archivo of archivos" class="archivo-item">
                <div class="archivo-info">
                  <i class="file-icon" [ngClass]="getFileIcon(archivo.tipoArchivo)"></i>
                  <div>
                    <div class="archivo-nombre">{{ archivo.nombreArchivo }}</div>
                    <div class="archivo-meta">
                      {{ archivo.tipoAdjunto }} • 
                      {{ formatFileSize(archivo.tamanoArchivo) }} • 
                      {{ archivo.fechaSubida | date:'dd/MM/yyyy HH:mm' }} • 
                      {{ archivo.subidoPor }}
                    </div>
                  </div>
                </div>
                <div class="archivo-actions">
                  <button (click)="descargarArchivo(archivo)" class="btn btn-sm btn-info">
                    Descargar
                  </button>
                  <button *ngIf="esTecnicoOSuperior" (click)="eliminarArchivo(archivo)" 
                          class="btn btn-sm btn-danger">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Historial -->
        <div class="card">
          <div class="card-header">
            <h3>Historial de Cambios</h3>
          </div>
          <div class="card-body">
            <div *ngIf="historial.length === 0" class="no-data">
              No hay historial disponible
            </div>
            <div *ngIf="historial.length > 0" class="historial-lista">
              <div *ngFor="let evento of historial" class="historial-item">
                <div class="historial-fecha">
                  {{ evento.fechaAccion | date:'dd/MM/yyyy HH:mm' }}
                </div>
                <div class="historial-contenido">
                  <div class="historial-accion">{{ evento.accion }}</div>
                  <div class="historial-usuario">por {{ evento.realizadoPor }}</div>
                  <div *ngIf="evento.comentarios" class="historial-comentarios">
                    {{ evento.comentarios }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="card" *ngIf="dispositivo.observaciones">
          <div class="card-header">
            <h3>Observaciones</h3>
          </div>
          <div class="card-body">
            <p>{{ dispositivo.observaciones }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de subida de archivos -->
    <div *ngIf="mostrarModalArchivos" class="modal-overlay" (click)="cerrarModalArchivos()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Subir Archivos</h2>
          <button (click)="cerrarModalArchivos()" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Tipo de Adjunto:</label>
            <select [(ngModel)]="tipoAdjunto">
              <option value="Factura">Factura</option>
              <option value="Manual">Manual</option>
              <option value="Foto">Foto</option>
              <option value="Garantia">Garantía</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div class="form-group">
            <label>Archivos:</label>
            <input type="file" (change)="onFileSelected($event)" multiple 
                   accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx">
          </div>
          <div class="modal-actions">
            <button (click)="cerrarModalArchivos()" class="btn btn-outline">Cancelar</button>
            <button (click)="subirArchivosSeleccionados()" [disabled]="!archivosSeleccionados.length" 
                    class="btn btn-primary">Subir</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detalle-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      
      .actions {
        display: flex;
        gap: 10px;
      }
    }

    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      overflow: hidden;
    }

    .card-header {
      background: #f8f9fa;
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h2, h3 {
        margin: 0;
        color: #333;
      }
      
      .badges {
        display: flex;
        gap: 8px;
      }
    }

    .card-body {
      padding: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      
      label {
        font-weight: 600;
        color: #666;
        font-size: 12px;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      
      span {
        color: #333;
        font-size: 14px;
      }
    }

    .archivos-lista {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .archivo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 4px;
      
      .archivo-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .file-icon {
          width: 24px;
          height: 24px;
          
          &.pdf::before { content: "📄"; }
          &.doc::before { content: "📄"; }
          &.image::before { content: "🖼️"; }
          &.excel::before { content: "📊"; }
          &.default::before { content: "📎"; }
        }
        
        .archivo-nombre {
          font-weight: 500;
          color: #333;
        }
        
        .archivo-meta {
          font-size: 12px;
          color: #666;
        }
      }
      
      .archivo-actions {
        display: flex;
        gap: 5px;
      }
    }

    .historial-lista {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .historial-item {
      display: flex;
      gap: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      .historial-fecha {
        flex-shrink: 0;
        font-size: 12px;
        color: #666;
        font-weight: 500;
        width: 120px;
      }
      
      .historial-contenido {
        flex: 1;
        
        .historial-accion {
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }
        
        .historial-usuario {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .historial-comentarios {
          font-size: 14px;
          color: #555;
        }
      }
    }

    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      
      &.estado-disponible { background: #e8f5e8; color: #4caf50; }
      &.estado-asignado { background: #fff3e0; color: #ff9800; }
      &.estado-reparacion { background: #ffebee; color: #f44336; }
      &.estado-baja { background: #f3e5f5; color: #9c27b0; }
      
      &.condicion-excelente { background: #e8f5e8; color: #4caf50; }
      &.condicion-bueno { background: #f1f8e9; color: #8bc34a; }
      &.condicion-regular { background: #fff3e0; color: #ff9800; }
      &.condicion-malo { background: #ffebee; color: #f44336; }
      
      &.garantia-vigente { background: #e8f5e8; color: #4caf50; }
      &.garantia-por-vencer { background: #fff3e0; color: #ff9800; }
      &.garantia-vencida { background: #ffebee; color: #f44336; }
    }

    @media (max-width: 768px) {
      .header-actions {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
        
        .actions {
          justify-content: center;
        }
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .archivo-item {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;
        
        .archivo-actions {
          justify-content: center;
        }
      }
      
      .historial-item {
        flex-direction: column;
        gap: 5px;
        
        .historial-fecha {
          width: auto;
        }
      }
    }
  `]
})
export class DispositivoDetalleComponent implements OnInit {
  dispositivoId!: number;
  dispositivo: any = null;
  archivos: any[] = [];
  historial: any[] = [];
  loading = true;
  error = '';

  // Modal de archivos
  mostrarModalArchivos = false;
  tipoAdjunto = 'Otro';
  archivosSeleccionados: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.dispositivoId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.dispositivoId) {
      this.cargarDispositivo();
    } else {
      this.error = 'ID de dispositivo no válido';
      this.loading = false;
    }
  }

  cargarDispositivo() {
    this.loading = true;
    this.dataService.getDispositivo(this.dispositivoId).subscribe({
      next: (response) => {
        this.dispositivo = response.dispositivo;
        this.archivos = response.archivos || [];
        this.historial = response.historial || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error cargando la información del dispositivo';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  volver() {
    this.router.navigate(['/dispositivos']);
  }

  editarDispositivo() {
    // Implementar navegación a edición o abrir modal de edición
    this.router.navigate(['/dispositivos', this.dispositivoId, 'editar']);
  }

  eliminarDispositivo() {
    if (confirm(`¿Estás seguro de dar de baja el dispositivo "${this.dispositivo.nombreDispositivo}"?`)) {
      this.dataService.eliminarDispositivo(this.dispositivoId).subscribe({
        next: () => {
          this.router.navigate(['/dispositivos']);
        },
        error: (error) => {
          console.error('Error eliminando dispositivo:', error);
          alert('Error al eliminar el dispositivo');
        }
      });
    }
  }

  subirArchivos() {
    this.mostrarModalArchivos = true;
  }

  cerrarModalArchivos() {
    this.mostrarModalArchivos = false;
    this.archivosSeleccionados = [];
    this.tipoAdjunto = 'Otro';
  }

  onFileSelected(event: any) {
    this.archivosSeleccionados = Array.from(event.target.files);
  }

  subirArchivosSeleccionados() {
    if (this.archivosSeleccionados.length === 0) return;

    const formData = new FormData();
    this.archivosSeleccionados.forEach(file => {
      formData.append('archivos', file);
    });
    formData.append('tipoAdjunto', this.tipoAdjunto);

    this.dataService.subirArchivos(this.dispositivoId, formData).subscribe({
      next: () => {
        this.cerrarModalArchivos();
        this.cargarDispositivo(); // Recargar para mostrar los nuevos archivos
      },
      error: (error) => {
        console.error('Error subiendo archivos:', error);
        alert('Error al subir los archivos');
      }
    });
  }

  eliminarArchivo(archivo: any) {
    if (confirm(`¿Estás seguro de eliminar el archivo "${archivo.nombreArchivo}"?`)) {
      this.dataService.eliminarArchivo(this.dispositivoId, archivo.archivoID).subscribe({
        next: () => {
          this.cargarDispositivo(); // Recargar para actualizar la lista
        },
        error: (error) => {
          console.error('Error eliminando archivo:', error);
          alert('Error al eliminar el archivo');
        }
      });
    }
  }

  descargarArchivo(archivo: any) {
    // Implementar descarga del archivo
    const url = `${environment.apiUrl.replace('/api', '')}/${archivo.rutaArchivo}`;
    window.open(url, '_blank');
  }

  // Métodos de utilidad
  tieneEspecificaciones(): boolean {
    return !!(this.dispositivo.procesador || this.dispositivo.memoriaRAM || 
             this.dispositivo.almacenamiento || this.dispositivo.sistemaOperativo);
  }

  tieneInfoCompra(): boolean {
    return !!(this.dispositivo.fechaCompra || this.dispositivo.precioCompra || 
             this.dispositivo.vencimientoGarantia || this.dispositivo.numeroFactura);
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Disponible': 'estado-disponible',
      'Asignado': 'estado-asignado',
      'En Reparacion': 'estado-reparacion',
      'Dado de Baja': 'estado-baja',
      'Perdido': 'estado-perdido'
    };
    return clases[estado] || '';
  }

  getCondicionClass(condicion: string): string {
    const clases: { [key: string]: string } = {
      'Excelente': 'condicion-excelente',
      'Bueno': 'condicion-bueno',
      'Regular': 'condicion-regular',
      'Malo': 'condicion-malo'
    };
    return clases[condicion] || '';
  }

  getGarantiaClass(estadoGarantia: string): string {
    const clases: { [key: string]: string } = {
      'Vigente': 'garantia-vigente',
      'Por Vencer': 'garantia-por-vencer',
      'Vencida': 'garantia-vencida'
    };
    return clases[estadoGarantia] || '';
  }

  getFileIcon(tipoArchivo: string): string {
    const iconos: { [key: string]: string } = {
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'doc',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'xls': 'excel',
      'xlsx': 'excel'
    };
    return iconos[tipoArchivo?.toLowerCase()] || 'default';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get esAdmin(): boolean {
    return this.authService.hasRole(['Administrador']);
  }

  get esTecnicoOSuperior(): boolean {
    return this.authService.hasRole(['Administrador', 'Gerente', 'Tecnico']);
  }
}