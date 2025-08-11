import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/AuthService';
import { Dispositivo, Categoria, Marca, Ubicacion } from '../../models';

@Component({
  selector: 'app-dispositivos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dispositivos.html',
  styleUrls: ['./dispositivos.scss']
})
export class Dispositivos implements OnInit {
  dispositivos: Dispositivo[] = [];
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  ubicaciones: Ubicacion[] = [];
  
  loading = true;
  error = '';
  
  // Filtros
  filtros = {
    buscar: '',
    categoria: '',
    marca: '',
    estado: '',
    pagina: 1,
    limite: 10
  };
  
  // Paginación
  paginacion = {
    paginaActual: 1,
    totalPaginas: 0,
    totalRegistros: 0,
    registrosPorPagina: 10,
    tieneAnterior: false,
    tieneSiguiente: false
  };

  // Estados y condiciones disponibles
  estados = ['Disponible', 'Asignado', 'En Reparacion', 'Dado de Baja', 'Perdido'];
  condiciones = ['Excelente', 'Bueno', 'Regular', 'Malo'];

  // Modal para crear/editar
  mostrarModal = false;
  dispositivoActual: Partial<Dispositivo> = {};
  editando = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarCatalogos();
    this.cargarDispositivos();
  }

  cargarCatalogos() {
    Promise.all([
      this.dataService.getCategorias().toPromise(),
      this.dataService.getMarcas().toPromise(),
      this.dataService.getUbicaciones().toPromise()
    ]).then(([categorias, marcas, ubicaciones]) => {
      this.categorias = categorias?.categorias || [];
      this.marcas = marcas?.marcas || [];
      this.ubicaciones = ubicaciones?.ubicaciones || [];
    }).catch(error => {
      console.error('Error cargando catálogos:', error);
    });
  }

  cargarDispositivos() {
    this.loading = true;
    this.dataService.getDispositivos(this.filtros).subscribe({
      next: (response) => {
        this.dispositivos = response.dispositivos || [];
        this.paginacion = response.paginacion || this.paginacion;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error cargando dispositivos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  aplicarFiltros() {
    this.filtros.pagina = 1;
    this.cargarDispositivos();
  }

  limpiarFiltros() {
    this.filtros = {
      buscar: '',
      categoria: '',
      marca: '',
      estado: '',
      pagina: 1,
      limite: 10
    };
    this.cargarDispositivos();
  }

  cambiarPagina(pagina: number) {
    this.filtros.pagina = pagina;
    this.cargarDispositivos();
  }

  nuevoDispositivo() {
    this.dispositivoActual = {
      estado: 'Disponible',
      condicion: 'Bueno'
    };
    this.editando = false;
    this.mostrarModal = true;
  }

  editarDispositivo(dispositivo: Dispositivo) {
    this.dispositivoActual = { ...dispositivo };
    this.editando = true;
    this.mostrarModal = true;
  }

  guardarDispositivo() {
    if (this.editando && this.dispositivoActual.dispositivoID) {
      this.dataService.actualizarDispositivo(this.dispositivoActual.dispositivoID, this.dispositivoActual)
        .subscribe({
          next: () => {
            this.mostrarModal = false;
            this.cargarDispositivos();
          },
          error: (error) => {
            console.error('Error actualizando dispositivo:', error);
          }
        });
    } else {
      this.dataService.crearDispositivo(this.dispositivoActual).subscribe({
        next: () => {
          this.mostrarModal = false;
          this.cargarDispositivos();
        },
        error: (error) => {
          console.error('Error creando dispositivo:', error);
        }
      });
    }
  }

  eliminarDispositivo(dispositivo: Dispositivo) {
    if (confirm(`¿Estás seguro de dar de baja el dispositivo "${dispositivo.nombreDispositivo}"?`)) {
      this.dataService.eliminarDispositivo(dispositivo.dispositivoID!).subscribe({
        next: () => {
          this.cargarDispositivos();
        },
        error: (error) => {
          console.error('Error eliminando dispositivo:', error);
        }
      });
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.dispositivoActual = {};
  }

  get esAdmin(): boolean {
    return this.authService.hasRole(['Administrador']);
  }

  get esTecnicoOSuperior(): boolean {
    return this.authService.hasRole(['Administrador', 'Gerente', 'Tecnico']);
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
}