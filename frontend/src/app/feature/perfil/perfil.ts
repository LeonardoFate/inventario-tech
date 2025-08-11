// frontend/src/app/feature/perfil/perfil.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/AuthService';
import { Usuario } from '../../models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="perfil-container">
      <div class="perfil-header">
        <h1>Mi Perfil</h1>
        <p>Gestiona tu información personal y configuración de cuenta</p>
      </div>

      <div class="perfil-content">
        
        <!-- Información Personal -->
        <div class="perfil-card">
          <div class="card-header">
            <h3>👤 Información Personal</h3>
            <button *ngIf="!editandoPerfil" (click)="editarPerfil()" class="btn btn-outline btn-sm">
              ✏️ Editar
            </button>
          </div>
          
          <div class="card-body">
            <form *ngIf="editandoPerfil" (ngSubmit)="guardarPerfil()">
              <div class="form-row">
                <div class="form-group">
                  <label>Nombres *</label>
                  <input type="text" [(ngModel)]="perfilData.nombres" name="nombres" required>
                </div>
                <div class="form-group">
                  <label>Apellidos *</label>
                  <input type="text" [(ngModel)]="perfilData.apellidos" name="apellidos" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" [(ngModel)]="perfilData.email" name="email" required>
                </div>
                <div class="form-group">
                  <label>Cédula</label>
                  <input type="text" [(ngModel)]="perfilData.cedula" name="cedula" maxlength="10">
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" (click)="cancelarEdicion()" class="btn btn-outline">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
            
            <div *ngIf="!editandoPerfil" class="info-display">
              <div class="info-grid">
                <div class="info-item">
                  <label>Nombre Completo:</label>
                  <span>{{ usuario?.nombres }} {{ usuario?.apellidos }}</span>
                </div>
                <div class="info-item">
                  <label>Usuario:</label>
                  <span>{{ usuario?.nombreUsuario }}</span>
                </div>
                <div class="info-item">
                  <label>Email:</label>
                  <span>{{ usuario?.email }}</span>
                </div>
                <div class="info-item">
                  <label>Cédula:</label>
                  <span>{{ usuario?.cedula || 'No especificada' }}</span>
                </div>
                <div class="info-item">
                  <label>Rol:</label>
                  <span class="rol-badge" [ngClass]="getRolClass(usuario?.rol || '')">
                    {{ usuario?.rol }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Departamento:</label>
                  <span>{{ usuario?.departamento || 'No asignado' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cambiar Contraseña -->
        <div class="perfil-card">
          <div class="card-header">
            <h3>🔐 Seguridad</h3>
          </div>
          
          <div class="card-body">
            <form (ngSubmit)="cambiarContrasena()">
              <div class="form-group">
                <label>Contraseña Actual *</label>
                <input type="password" [(ngModel)]="passwordData.actual" 
                       name="passwordActual" required placeholder="Ingresa tu contraseña actual">
              </div>
              
              <div class="form-group">
                <label>Nueva Contraseña *</label>
                <input type="password" [(ngModel)]="passwordData.nueva" 
                       name="passwordNueva" required placeholder="Mínimo 6 caracteres">
                <div class="password-strength" *ngIf="passwordData.nueva">
                  <div class="strength-bar" [ngClass]="getPasswordStrength(passwordData.nueva)"></div>
                  <span class="strength-text">{{ getPasswordStrengthText(passwordData.nueva) }}</span>
                </div>
              </div>
              
              <div class="form-group">
                <label>Confirmar Nueva Contraseña *</label>
                <input type="password" [(ngModel)]="passwordData.confirmar" 
                       name="passwordConfirmar" required placeholder="Repite la nueva contraseña">
                <div *ngIf="passwordData.nueva && passwordData.confirmar && passwordData.nueva !== passwordData.confirmar" 
                     class="error-message">
                  Las contraseñas no coinciden
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-warning" 
                        [disabled]="!passwordData.actual || !passwordData.nueva || !passwordData.confirmar || passwordData.nueva !== passwordData.confirmar">
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Actividad Reciente -->
        <div class="perfil-card">
          <div class="card-header">
            <h3>📊 Actividad Reciente</h3>
          </div>
          
          <div class="card-body">
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon">🔑</div>
                <div class="activity-content">
                  <div class="activity-title">Último acceso al sistema</div>
                  <div class="activity-time">{{ usuario && usuario.fechaUltimoAcceso ? (usuario.fechaUltimoAcceso | date:'dd/MM/yyyy HH:mm') : 'No disponible' }}</div>
                </div>
              </div>
              
              <div class="activity-item">
                <div class="activity-icon">👤</div>
                <div class="activity-content">
                  <div class="activity-title">Cuenta creada</div>
                  <div class="activity-time">{{ usuario && usuario.fechaCreacion ? (usuario.fechaCreacion | date:'dd/MM/yyyy') : 'No disponible' }}</div>
                </div>
              </div>
              
              <div class="activity-item">
                <div class="activity-icon">💻</div>
                <div class="activity-content">
                  <div class="activity-title">Dispositivos asignados</div>
                  <div class="activity-time">{{ dispositivosAsignados }} dispositivos activos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .perfil-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .perfil-header {
      margin-bottom: 30px;
      text-align: center;
      
      h1 {
        color: #333;
        margin-bottom: 10px;
      }
      
      p {
        color: #666;
        font-size: 16px;
      }
    }

    .perfil-content {
      display: grid;
      gap: 30px;
    }

    .perfil-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      background: #f8f9fa;
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        color: #495057;
        font-size: 1.1rem;
      }
    }

    .card-body {
      padding: 25px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
      
      label {
        font-weight: 600;
        color: #6c757d;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      span {
        color: #495057;
        font-size: 15px;
      }
    }

    .rol-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: fit-content;
      
      &.rol-admin {
        background: linear-gradient(135deg, #dc3545, #c82333);
        color: white;
      }
      
      &.rol-gerente {
        background: linear-gradient(135deg, #fd7e14, #e55a00);
        color: white;
      }
      
      &.rol-tecnico {
        background: linear-gradient(135deg, #0d6efd, #0056b3);
        color: white;
      }
      
      &.rol-empleado {
        background: linear-gradient(135deg, #198754, #146c43);
        color: white;
      }
    }

    .password-strength {
      margin-top: 8px;
      
      .strength-bar {
        height: 4px;
        border-radius: 2px;
        margin-bottom: 5px;
        transition: all 0.3s ease;
        
        &.weak {
          background: #dc3545;
          width: 33%;
        }
        
        &.medium {
          background: #ffc107;
          width: 66%;
        }
        
        &.strong {
          background: #198754;
          width: 100%;
        }
      }
      
      .strength-text {
        font-size: 12px;
        color: #6c757d;
      }
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #0d6efd;
      
      .activity-icon {
        font-size: 24px;
        width: 40px;
        text-align: center;
      }
      
      .activity-content {
        flex: 1;
        
        .activity-title {
          font-weight: 500;
          color: #495057;
          margin-bottom: 2px;
        }
        
        .activity-time {
          font-size: 13px;
          color: #6c757d;
        }
      }
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }

    @media (max-width: 768px) {
      .perfil-container {
        padding: 15px;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .card-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }
    }
  `]
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  editandoPerfil = false;
  dispositivosAsignados = 0;
  
  perfilData = {
    nombres: '',
    apellidos: '',
    email: '',
    cedula: ''
  };
  
  passwordData = {
    actual: '',
    nueva: '',
    confirmar: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.usuario = this.authService.getCurrentUser();
    if (this.usuario) {
      this.perfilData = {
        nombres: this.usuario.nombres,
        apellidos: this.usuario.apellidos,
        email: this.usuario.email,
        cedula: this.usuario.cedula || ''
      };
    }
    this.cargarActividad();
  }

  editarPerfil() {
    this.editandoPerfil = true;
  }

  cancelarEdicion() {
    this.editandoPerfil = false;
    if (this.usuario) {
      this.perfilData = {
        nombres: this.usuario.nombres,
        apellidos: this.usuario.apellidos,
        email: this.usuario.email,
        cedula: this.usuario.cedula || ''
      };
    }
  }

  guardarPerfil() {
    // Implementar guardado del perfil
    console.log('Guardando perfil:', this.perfilData);
    this.editandoPerfil = false;
    
    // Aquí harías la llamada al backend para actualizar el perfil
    // this.authService.updateProfile(this.perfilData).subscribe(...)
  }

  cambiarContrasena() {
    if (this.passwordData.nueva !== this.passwordData.confirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    // Implementar cambio de contraseña
    console.log('Cambiando contraseña');
    
    // Aquí harías la llamada al backend
    // this.authService.changePassword(this.passwordData).subscribe(...)
    
    // Limpiar formulario
    this.passwordData = { actual: '', nueva: '', confirmar: '' };
  }

  cargarActividad() {
    // Cargar información de actividad del usuario
    this.dispositivosAsignados = 3; // Ejemplo
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

  getPasswordStrength(password: string): string {
    if (password.length < 6) return 'weak';
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(password: string): string {
    const strength = this.getPasswordStrength(password);
    const texts: { [key: string]: string } = {
      'weak': 'Débil',
      'medium': 'Media',
      'strong': 'Fuerte'
    };
    return texts[strength] || '';
  }
}