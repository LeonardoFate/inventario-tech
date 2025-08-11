// frontend/src/app/feature/reportes/reportes.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reportes-container">
      <div class="header">
        <h1>Reportes del Sistema</h1>
      </div>

      <!-- Filtros de reportes -->
      <div class="filtros-reportes">
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de Reporte:</label>
            <select [(ngModel)]="tipoReporte">
              <option value="inventario">Inventario General</option>
              <option value="asignaciones">Asignaciones Activas</option>
              <option value="garantias">Estado de Garantías</option>
              <option value="ubicaciones">Dispositivos por Ubicación</option>
              <option value="usuarios">Usuarios del Sistema</option>
              <option value="mantenimiento">Historial de Mantenimiento</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Fecha Desde:</label>
            <input type="date" [(ngModel)]="fechaDesde">
          </div>
          
          <div class="form-group">
            <label>Fecha Hasta:</label>
            <input type="date" [(ngModel)]="fechaHasta">
          </div>
          
          <div class="form-group">
            <label>Formato:</label>
            <select [(ngModel)]="formato">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
        
        <div class="acciones-reportes">
          <button (click)="generarReporte()" class="btn btn-primary" [disabled]="generando">
            {{ generando ? 'Generando...' : 'Generar Reporte' }}
          </button>
          <button (click)="previsualizarReporte()" class="btn btn-secondary">
            Vista Previa
          </button>
        </div>
      </div>

      <!-- Reportes predefinidos -->
      <div class="reportes-predefinidos">
        <h3>Reportes Predefinidos</h3>
        <div class="reportes-grid">
          
          <div class="reporte-card">
            <h4>📊 Resumen Ejecutivo</h4>
            <p>Estadísticas generales del inventario y estado actual</p>
            <button (click)="generarResumenEjecutivo()" class="btn btn-outline">
              Generar
            </button>
          </div>
          
          <div class="reporte-card">
            <h4>⚠️ Garantías por Vencer</h4>
            <p>Dispositivos con garantías próximas a vencer</p>
            <button (click)="generarReporteGarantias()" class="btn btn-outline">
              Generar
            </button>
          </div>
          
          <div class="reporte-card">
            <h4>📍 Inventario por Ubicación</h4>
            <p>Distribución de dispositivos por ubicación física</p>
            <button (click)="generarReporteUbicaciones()" class="btn btn-outline">
              Generar
            </button>
          </div>
          
          <div class="reporte-card">
            <h4>💰 Valoración del Inventario</h4>
            <p>Valor total y depreciación de los activos</p>
            <button (click)="generarReporteValoracion()" class="btn btn-outline">
              Generar
            </button>
          </div>
          
          <div class="reporte-card">
            <h4>👥 Asignaciones por Usuario</h4>
            <p>Dispositivos asignados a cada usuario</p>
            <button (click)="generarReporteAsignaciones()" class="btn btn-outline">
              Generar
            </button>
          </div>
          
          <div class="reporte-card">
            <h4>🔧 Historial de Mantenimiento</h4>
            <p>Registro de mantenimientos y reparaciones</p>
            <button (click)="generarReporteMantenimiento()" class="btn btn-outline">
              Generar
            </button>
          </div>
          
        </div>
      </div>

      <!-- Historial de reportes generados -->
      <div class="historial-reportes">
        <h3>Reportes Generados Recientemente</h3>
        <div class="tabla-container">
          <table class="reportes-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Generado por</th>
                <th>Formato</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reporte of historialReportes">
                <td>{{ reporte.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ reporte.tipo }}</td>
                <td>{{ reporte.generadoPor }}</td>
                <td>{{ reporte.formato.toUpperCase() }}</td>
                <td>
                  <span class="estado-badge" [ngClass]="getEstadoReporteClass(reporte.estado)">
                    {{ reporte.estado }}
                  </span>
                </td>
                <td class="acciones">
                  <button *ngIf="reporte.estado === 'Completado'" 
                          (click)="descargarReporte(reporte)" 
                          class="btn btn-sm btn-success">
                    Descargar
                  </button>
                  <button (click)="eliminarReporte(reporte)" 
                          class="btn btn-sm btn-danger">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="historialReportes.length === 0" class="no-data">
            No hay reportes generados recientemente.
          </div>
        </div>
      </div>

      <!-- Vista previa -->
      <div *ngIf="mostrarVistaPrevia" class="vista-previa">
        <h3>Vista Previa del Reporte</h3>
        <div class="vista-previa-contenido">
          <div class="stats-preview">
            <div class="stat-item">
              <strong>Total de Registros:</strong> {{ datosVistaPrevia.totalRegistros }}
            </div>
            <div class="stat-item">
              <strong>Período:</strong> {{ fechaDesde }} - {{ fechaHasta }}
            </div>
            <div class="stat-item">
              <strong>Columnas:</strong> {{ datosVistaPrevia.columnas.join(', ') }}
            </div>
          </div>
          
          <div class="muestra-datos" *ngIf="datosVistaPrevia.muestra">
            <h4>Muestra de Datos (primeros 5 registros):</h4>
            <table class="muestra-table">
              <thead>
                <tr>
                  <th *ngFor="let columna of datosVistaPrevia.columnas">{{ columna }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fila of datosVistaPrevia.muestra">
                  <td *ngFor="let valor of fila">{{ valor }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reportes-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filtros-reportes {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .acciones-reportes {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .reportes-predefinidos {
      margin-bottom: 30px;
      
      h3 {
        margin-bottom: 20px;
        color: #333;
      }
    }

    .reportes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .reporte-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #1976d2;
      
      h4 {
        margin: 0 0 10px 0;
        color: #1976d2;
      }
      
      p {
        margin: 0 0 15px 0;
        color: #666;
        font-size: 14px;
      }
    }

    .historial-reportes {
      margin-bottom: 30px;
      
      h3 {
        margin-bottom: 20px;
        color: #333;
      }
    }

    .reportes-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      th {
        background: #f8f9fa;
        font-weight: 600;
      }
      
      tbody tr:hover {
        background: #f9f9f9;
      }
    }

    .vista-previa {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 20px;
      
      h3 {
        margin-bottom: 20px;
        color: #333;
      }
    }

    .stats-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
      
      .stat-item {
        padding: 10px;
        background: #f8f9fa;
        border-radius: 4px;
        border-left: 3px solid #1976d2;
      }
    }

    .muestra-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      
      th, td {
        padding: 8px;
        border: 1px solid #ddd;
        text-align: left;
      }
      
      th {
        background: #f8f9fa;
      }
    }

    .estado-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      
      &.estado-completado { background: #e8f5e8; color: #4caf50; }
      &.estado-generando { background: #fff3e0; color: #ff9800; }
      &.estado-error { background: #ffebee; color: #f44336; }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .reportes-grid {
        grid-template-columns: 1fr;
      }
      
      .acciones-reportes {
        flex-direction: column;
      }
    }
  `]
})
export class ReportesComponent implements OnInit {
  tipoReporte = 'inventario';
  fechaDesde = '';
  fechaHasta = '';
  formato = 'pdf';
  generando = false;
  mostrarVistaPrevia = false;
  
  datosVistaPrevia = {
    totalRegistros: 0,
    columnas: [] as string[],
    muestra: [] as any[]
  };
  
  historialReportes = [
    {
      id: 1,
      fecha: new Date(),
      tipo: 'Inventario General',
      generadoPor: 'Admin Sistema',
      formato: 'pdf',
      estado: 'Completado'
    }
  ];

  constructor(
    private dataService: DataService,
    public authService: AuthService
  ) {
    // Establecer fechas por defecto
    const hoy = new Date();
    const hace30dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    this.fechaHasta = hoy.toISOString().split('T')[0];
    this.fechaDesde = hace30dias.toISOString().split('T')[0];
  }

  ngOnInit() {
    // Cargar historial de reportes
  }

  generarReporte() {
    this.generando = true;
    
    console.log('Generando reporte:', {
      tipo: this.tipoReporte,
      desde: this.fechaDesde,
      hasta: this.fechaHasta,
      formato: this.formato
    });
    
    // Simular generación
    setTimeout(() => {
      this.generando = false;
      alert('Reporte generado exitosamente. Se descargará automáticamente.');
    }, 3000);
  }

  previsualizarReporte() {
    // Generar datos de vista previa basados en el tipo de reporte
    this.datosVistaPrevia = {
      totalRegistros: 150,
      columnas: this.getColumnasReporte(this.tipoReporte),
      muestra: this.getMuestraReporte(this.tipoReporte)
    };
    
    this.mostrarVistaPrevia = true;
  }

  generarResumenEjecutivo() {
    this.tipoReporte = 'inventario';
    this.generarReporte();
  }

  generarReporteGarantias() {
    this.tipoReporte = 'garantias';
    this.generarReporte();
  }

  generarReporteUbicaciones() {
    this.tipoReporte = 'ubicaciones';
    this.generarReporte();
  }

  generarReporteValoracion() {
    this.tipoReporte = 'valoracion';
    this.generarReporte();
  }

  generarReporteAsignaciones() {
    this.tipoReporte = 'asignaciones';
    this.generarReporte();
  }

  generarReporteMantenimiento() {
    this.tipoReporte = 'mantenimiento';
    this.generarReporte();
  }

  descargarReporte(reporte: any) {
    console.log('Descargando reporte:', reporte);
    // Implementar descarga del reporte
  }

  eliminarReporte(reporte: any) {
    if (confirm('¿Eliminar este reporte del historial?')) {
      this.historialReportes = this.historialReportes.filter(r => r.id !== reporte.id);
    }
  }

  getEstadoReporteClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Completado': 'estado-completado',
      'Generando': 'estado-generando',
      'Error': 'estado-error'
    };
    return clases[estado] || '';
  }

  private getColumnasReporte(tipo: string): string[] {
    const columnas: { [key: string]: string[] } = {
      'inventario': ['Código', 'Nombre', 'Categoría', 'Marca', 'Estado', 'Ubicación', 'Valor'],
      'asignaciones': ['Dispositivo', 'Usuario', 'Fecha Asignación', 'Estado', 'Departamento'],
      'garantias': ['Dispositivo', 'Fecha Compra', 'Vencimiento', 'Estado Garantía', 'Días Restantes'],
      'ubicaciones': ['Ubicación', 'Total Dispositivos', 'Valor Total', 'Responsable'],
      'usuarios': ['Usuario', 'Nombre', 'Departamento', 'Dispositivos Asignados', 'Último Acceso'],
      'mantenimiento': ['Dispositivo', 'Tipo Mantenimiento', 'Fecha', 'Técnico', 'Estado']
    };
    return columnas[tipo] || [];
  }

  private getMuestraReporte(tipo: string): any[] {
    const muestras: { [key: string]: any[] } = {
      'inventario': [
        ['LAP-001', 'Laptop Dell Latitude', 'Laptops', 'Dell', 'Disponible', 'Oficina Central', '$1,200'],
        ['MON-001', 'Monitor Samsung 24"', 'Monitores', 'Samsung', 'Asignado', 'Piso 2', '$300'],
        ['TEL-001', 'iPhone 13 Pro', 'Teléfonos', 'Apple', 'Disponible', 'Almacén', '$800']
      ],
      'asignaciones': [
        ['LAP-001', 'Juan Pérez', '15/01/2024', 'Activo', 'Sistemas'],
        ['MON-002', 'María García', '20/01/2024', 'Activo', 'Contabilidad']
      ],
      'garantias': [
        ['LAP-001', '15/01/2023', '15/01/2026', 'Vigente', '365'],
        ['MON-001', '10/12/2022', '10/12/2025', 'Por Vencer', '45']
      ]
    };
    return muestras[tipo] || [];
  }
}