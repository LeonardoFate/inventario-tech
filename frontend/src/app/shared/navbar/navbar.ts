// frontend/src/app/shared/navbar/navbar.ts
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService';
import { Usuario } from '../../models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  verPerfil(event: Event) {
    event.preventDefault();
    this.router.navigate(['/perfil']);
  }

  cambiarPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/perfil'], { fragment: 'password' });
  }

  get currentUser(): Usuario | null {
    return this.authService.getCurrentUser();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole(['Administrador']);
  }

  get isAdminOGerente(): boolean {
    return this.authService.hasRole(['Administrador', 'Gerente']);
  }

  get esTecnicoOSuperior(): boolean {
    return this.authService.hasRole(['Administrador', 'Gerente', 'Tecnico']);
  }
}