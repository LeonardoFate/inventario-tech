import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/AuthService';
import { Usuario, Ubicacion } from '../../models';
import { UsuariosService } from '../../services/UsuariosService';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class Usuarios implements OnInit {
  usuarios: Usuario[] = [];
  ubicaciones: Ubicacion[] = [];
  loading = true;
  error = '';
  
  // Modal
  mostrarModal = false;
  usuarioActual: Partial<Usuario> = {};
  editando = false;
  
  // Opciones
  roles = ['Administrador', 'Gerente', 'Tecnico', 'Empleado'];
  departamentos = [
    'Sistemas', 'Recursos Humanos', 'Contabilidad', 'Ventas', 
    'Marketing', 'Operaciones', 'Gerencia', 'Legal'
  ];

  constructor(
    private dataService: DataService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarUbicaciones();
  }

cargarUsuarios() {
  this.loading = true;
  this.error = '';

  this.dataService.getUsuarios().subscribe({
    next: (usuarios) => {
      console.log('✔️ Usuarios recibidos del backend:', usuarios);
      this.usuarios = usuarios; // Asegúrate que aquí es un array
      this.loading = false;
    },
    error: (err) => {
      console.error('❌ Error al cargar usuarios:', err);
      this.error = 'No se pudieron cargar los usuarios.';
      this.loading = false;
    }
  });
}



  cargarUbicaciones() {
    this.dataService.getUbicaciones().subscribe({
      next: (response) => {
        this.ubicaciones = response.ubicaciones || [];
      },
      error: (error) => {
        console.error('Error cargando ubicaciones:', error);
      }
    });
  }

  nuevoUsuario() {
    this.usuarioActual = {
      rol: 'Empleado',
      departamento: 'Sistemas'
    };
    this.editando = false;
    this.mostrarModal = true;
  }

  editarUsuario(usuario: Usuario) {
    this.usuarioActual = { ...usuario };
    this.editando = true;
    this.mostrarModal = true;
  }

  guardarUsuario() {
    if (this.editando) {
      // Actualizar usuario existente
      const index = this.usuarios.findIndex(u => u.UsuarioID === this.usuarioActual.UsuarioID);
      if (index !== -1) {
        this.usuarios[index] = { ...this.usuarioActual } as Usuario;
      }
    } else {
      // Crear nuevo usuario
      const nuevoUsuario: Usuario = {
        UsuarioID: Math.max(...this.usuarios.map(u => u.UsuarioID || 0)) + 1,
        nombreUsuario: this.usuarioActual.nombreUsuario || '',
        email: this.usuarioActual.email || '',
        nombres: this.usuarioActual.nombres || '',
        apellidos: this.usuarioActual.apellidos || '',
        rol: this.usuarioActual.rol || 'Empleado',
        departamento: this.usuarioActual.departamento || 'Sistemas',
        cedula: this.usuarioActual.cedula,
        ubicacionId: this.usuarioActual.ubicacionId
      };
      this.usuarios.push(nuevoUsuario);
    }

    this.mostrarModal = false;
    this.usuarioActual = {};
  }

  eliminarUsuario(usuario: Usuario) {
    if (usuario.UsuarioID === this.authService.getCurrentUser()?.UsuarioID) {
      alert('No puedes eliminar tu propio usuario');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al usuario "${usuario.nombres} ${usuario.apellidos}"?`)) {
      this.usuarios = this.usuarios.filter(u => u.UsuarioID !== usuario.UsuarioID);
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioActual = {};
  }

  getRolClass(rol: string): string {
    const clases: { [key: string]: string } = {
      'Administrador': 'rol-admin',
      'Gerente': 'rol-gerente',
      'Tecnico': 'rol-tecnico',
      'Empleado': 'rol-empleado'
    };
    return clases[rol] || 'rol-empleado';
  }

  getUbicacionNombre(ubicacionId?: number): string {
    if (!ubicacionId) return 'Sin asignar';
    const ubicacion = this.ubicaciones.find(u => 
      (u.UbicacionID || u.ubicacionID) === ubicacionId
    );
    return ubicacion ? (ubicacion.NombreUbicacion || ubicacion.nombreUbicacion || 'N/A') : 'N/A';
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}