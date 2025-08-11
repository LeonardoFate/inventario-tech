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
    public authService: AuthService  // ✅ Cambiar de 'private' a 'public'
  ) {
    console.log('📱 Dispositivos - Constructor ejecutado');
  }

  ngOnInit() {
    console.log('📱 Dispositivos - ngOnInit iniciado');
    console.log('📱 Usuario actual:', this.authService.getCurrentUser());
    console.log('📱 Es técnico o superior:', this.esTecnicoOSuperior);
    console.log('📱 Es admin:', this.esAdmin);
    
    this.cargarCatalogos();
    this.cargarDispositivos();
  }

  cargarCatalogos() {
    console.log('📂 Dispositivos - Cargando catálogos...');
    
    Promise.all([
      this.dataService.getCategorias().toPromise(),
      this.dataService.getMarcas().toPromise(),
      this.dataService.getUbicaciones().toPromise()
    ]).then(([categorias, marcas, ubicaciones]) => {
      console.log('📂 Categorías cargadas:', categorias);
      console.log('📂 Marcas cargadas:', marcas);
      console.log('📂 Ubicaciones cargadas:', ubicaciones);
      
      this.categorias = categorias?.categorias || [];
      this.marcas = marcas?.marcas || [];
      this.ubicaciones = ubicaciones?.ubicaciones || [];
      
      console.log('📂 Catálogos asignados - Categorías:', this.categorias.length, 'Marcas:', this.marcas.length, 'Ubicaciones:', this.ubicaciones.length);
    }).catch(error => {
      console.error('❌ Error cargando catálogos:', error);
      this.error = 'Error cargando catálogos: ' + error.message;
    });
  }

  cargarDispositivos() {
    console.log('📱 Dispositivos - Cargando dispositivos con filtros:', this.filtros);
    
    this.loading = true;
    this.error = '';
    
    this.dataService.getDispositivos(this.filtros).subscribe({
      next: (response) => {
        console.log('✅ Dispositivos - Respuesta recibida:', response);
        
        this.dispositivos = response.dispositivos || [];
        this.paginacion = response.paginacion || this.paginacion;
        this.loading = false;
        
        console.log('📱 Dispositivos cargados:', this.dispositivos.length);
        console.log('📊 Paginación:', this.paginacion);
      },
      error: (error) => {
        console.error('❌ Error cargando dispositivos:', error);
        this.error = 'Error cargando dispositivos: ' + error.message;
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    console.log('🔍 Aplicando filtros:', this.filtros);
    this.filtros.pagina = 1;
    this.cargarDispositivos();
  }

  limpiarFiltros() {
    console.log('🧹 Limpiando filtros');
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
    console.log('📄 Cambiando a página:', pagina);
    this.filtros.pagina = pagina;
    this.cargarDispositivos();
  }

  nuevoDispositivo() {
    console.log('➕ Creando nuevo dispositivo');
    this.dispositivoActual = {
      estado: 'Disponible',
      condicion: 'Bueno'
    };
    this.editando = false;
    this.mostrarModal = true;
  }

  editarDispositivo(dispositivo: Dispositivo) {
    console.log('✏️ Editando dispositivo:', dispositivo);
    this.dispositivoActual = { ...dispositivo };
    this.editando = true;
    this.mostrarModal = true;
  }

  guardarDispositivo() {
    console.log('💾 Guardando dispositivo:', this.dispositivoActual);
    
    if (this.editando && this.dispositivoActual.dispositivoID) {
      this.dataService.actualizarDispositivo(this.dispositivoActual.dispositivoID, this.dispositivoActual)
        .subscribe({
          next: () => {
            console.log('✅ Dispositivo actualizado');
            this.mostrarModal = false;
            this.cargarDispositivos();
          },
          error: (error) => {
            console.error('❌ Error actualizando dispositivo:', error);
          }
        });
    } else {
      this.dataService.crearDispositivo(this.dispositivoActual).subscribe({
        next: () => {
          console.log('✅ Dispositivo creado');
          this.mostrarModal = false;
          this.cargarDispositivos();
        },
        error: (error) => {
          console.error('❌ Error creando dispositivo:', error);
        }
      });
    }
  }

  eliminarDispositivo(dispositivo: Dispositivo) {
    // Usar PascalCase o camelCase como fallback
    const nombreDispositivo = dispositivo.NombreDispositivo || dispositivo.nombreDispositivo || 'Dispositivo sin nombre';
    
    if (confirm(`¿Estás seguro de dar de baja el dispositivo "${nombreDispositivo}"?`)) {
      console.log('🗑️ Eliminando dispositivo:', dispositivo);
      
      // Usar PascalCase o camelCase como fallback para el ID
      const dispositivoId = dispositivo.DispositivoID || dispositivo.dispositivoID;
      
      if (!dispositivoId) {
        console.error('❌ No se pudo obtener el ID del dispositivo');
        alert('Error: No se pudo obtener el ID del dispositivo');
        return;
      }
      
      this.dataService.eliminarDispositivo(dispositivoId).subscribe({
        next: () => {
          console.log('✅ Dispositivo eliminado');
          this.cargarDispositivos();
        },
        error: (error) => {
          console.error('❌ Error eliminando dispositivo:', error);
          alert('Error eliminando dispositivo: ' + error.message);
        }
      });
    }
  }

  cerrarModal() {
    console.log('❌ Cerrando modal');
    this.mostrarModal = false;
    this.dispositivoActual = {};
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get esAdmin(): boolean {
    const result = this.authService.hasRole(['Administrador']);
    console.log('🔐 Es admin:', result);
    return result;
  }

  get esTecnicoOSuperior(): boolean {
    const result = this.authService.hasRole(['Administrador', 'Gerente', 'Tecnico']);
    console.log('🔐 Es técnico o superior:', result);
    return result;
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