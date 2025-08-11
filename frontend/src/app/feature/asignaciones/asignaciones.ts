// frontend/src/app/feature/asignaciones/asignaciones.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/AuthService';

interface Asignacion {
  id: number;
  dispositivo: string;
  usuario: string;
  fechaAsignacion: Date;
  fechaDevolucion?: Date;
  estado: 'Activo' | 'Devuelto' | 'Perdido';
  observaciones?: string;
}

@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="asignaciones-container">
      <div class="header">
        <h1>Gestión de Asignaciones</h1>
        <button *ngIf="canAssign" (click)="nuevaAsignacion()" class="btn btn-primary">
          Nueva Asignación
        </button>
      </div>

      <!-- Filtros -->
      <div class="filtros">
        <div class="filtros-row">
          <div class="filtro-group">
            <label>Buscar Usuario:</label>
            <input type="text" [(ngModel)]="filtros.usuario" placeholder="Nombre del usuario...">
          </div>
          
          <div class="filtro-group">
            <label>Estado:</label>
            <select [(ngModel)]="filtros.estado">
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Devuelto">Devuelto</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>
          
          <div class="filtro-actions">
            <button (click)="aplicarFiltros()" class="btn btn-secondary">Filtrar</button>
            <button (click)="limpiarFiltros()" class="btn btn-outline">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        Cargando asignaciones...
      </div>

      <!-- Error -->
      <div *ngIf="error" class="error">
        {{ error }}
      </div>

      <!-- Tabla -->
      <div *ngIf="!loading && !error" class="tabla-container">
        <table class="asignaciones-table">
          <thead>
            <tr>
              <th>Dispositivo</th>
              <th>Usuario Asignado</th>
              <th>Fecha Asignación</th>
              <th>Fecha Devolución</th>
              <th>Estado</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let asignacion of asignaciones">
              <td>{{ asignacion.dispositivo }}</td>
              <td>{{ asignacion.usuario }}</td>
              <td>{{ asignacion.fechaAsignacion | date:'dd/MM/yyyy' }}</td>
              <td>{{ asignacion.fechaDevolucion ? (asignacion.fechaDevolucion | date:'dd/MM/yyyy') : '-' }}</td>
              <td>
                <span class="estado-badge" [ngClass]="getEstadoClass(asignacion.estado)">
                  {{ asignacion.estado }}
                </span>
              </td>
              <td>{{ asignacion.observaciones || '-' }}</td>
              <td class="acciones">
                <button *ngIf="asignacion.estado === 'Activo'" 
                        (click)="devolverDispositivo(asignacion)" 
                        class="btn btn-sm btn-success">
                  Devolver
                </button>
                <button *ngIf="asignacion.estado === 'Activo'" 
                        (click)="reportarPerdido(asignacion)" 
                        class="btn btn-sm btn-warning">
                  Reportar Perdido
                </button>
                <button (click)="verDetalle(asignacion)" class="btn btn-sm btn-info">
                  Ver Detalle
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="asignaciones.length === 0" class="no-data">
          No hay asignaciones registradas.
        </div>
      </div>
    </div>

    <!-- Modal Nueva Asignación -->
    <div *ngIf="mostrarModal" class="modal-overlay" (click)="cerrarModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Nueva Asignación</h2>
          <button (click)="cerrarModal()" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <form (ngSubmit)="guardarAsignacion()">
            <div class="form-group">
              <label>Dispositivo *</label>
              <select [(ngModel)]="nuevaAsignacionData.dispositivoId" name="dispositivoId" required>
                <option value="">Seleccionar dispositivo</option>
                <option *ngFor="let dispositivo of dispositivosDisponibles" [value]="dispositivo.id">
                  {{ dispositivo.codigo }} - {{ dispositivo.nombre }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Usuario *</label>
              <select [(ngModel)]="nuevaAsignacionData.usuarioId" name="usuarioId" required>
                <option value="">Seleccionar usuario</option>
                <option *ngFor="let usuario of usuarios" [value]="usuario.UsuarioID">
                  {{ usuario.nombres }} {{ usuario.apellidos }} ({{ usuario.departamento }})
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Fecha de Asignación *</label>
              <input type="date" [(ngModel)]="nuevaAsignacionData.fechaAsignacion" 
                     name="fechaAsignacion" required>
            </div>
            
            <div class="form-group">
              <label>Observaciones</label>
              <textarea [(ngModel)]="nuevaAsignacionData.observaciones" 
                        name="observaciones" rows="3" 
                        placeholder="Observaciones adicionales..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="cerrarModal()" class="btn btn-outline">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Crear Asignación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../dispositivos/dispositivos.scss']
})
export class AsignacionesComponent implements OnInit {
  asignaciones: Asignacion[] = [];
  usuarios: any[] = [];
  dispositivosDisponibles: any[] = [];
  loading = true;
  error = '';
  
  filtros = {
    usuario: '',
    estado: ''
  };
  
  mostrarModal = false;
  nuevaAsignacionData = {
    dispositivoId: '',
    usuarioId: '',
    fechaAsignacion: new Date().toISOString().split('T')[0],
    observaciones: ''
  };

  constructor(
    private dataService: DataService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarAsignaciones();
    this.cargarUsuarios();
    this.cargarDispositivosDisponibles();
  }

  cargarAsignaciones() {
    this.loading = true;
    // Implementar llamada al backend
    setTimeout(() => {
      this.asignaciones = []; // Datos de ejemplo
      this.loading = false;
    }, 1000);
  }

  cargarUsuarios() {
    this.dataService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  cargarDispositivosDisponibles() {
    this.dataService.getDispositivos({ estado: 'Disponible' }).subscribe({
      next: (response) => {
        this.dispositivosDisponibles = response.dispositivos || [];
      },
      error: (error) => {
        console.error('Error cargando dispositivos:', error);
      }
    });
  }

  aplicarFiltros() {
    this.cargarAsignaciones();
  }

  limpiarFiltros() {
    this.filtros = { usuario: '', estado: '' };
    this.cargarAsignaciones();
  }

  nuevaAsignacion() {
    this.mostrarModal = true;
  }

  guardarAsignacion() {
    // Implementar lógica de guardado
    console.log('Guardando asignación:', this.nuevaAsignacionData);
    this.mostrarModal = false;
  }

  devolverDispositivo(asignacion: Asignacion) {
    if (confirm('¿Confirmar devolución del dispositivo?')) {
      // Implementar lógica de devolución
      console.log('Devolviendo dispositivo:', asignacion);
    }
  }

  reportarPerdido(asignacion: Asignacion) {
    if (confirm('¿Reportar dispositivo como perdido?')) {
      // Implementar lógica de reporte de pérdida
      console.log('Reportando como perdido:', asignacion);
    }
  }

  verDetalle(asignacion: Asignacion) {
    // Implementar navegación a detalle
    console.log('Ver detalle:', asignacion);
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevaAsignacionData = {
      dispositivoId: '',
      usuarioId: '',
      fechaAsignacion: new Date().toISOString().split('T')[0],
      observaciones: ''
    };
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Activo': 'estado-activo',
      'Devuelto': 'estado-devuelto',
      'Perdido': 'estado-perdido'
    };
    return clases[estado] || '';
  }

  get canAssign(): boolean {
    return this.authService.hasRole(['Administrador', 'Gerente', 'Tecnico']);
  }
}