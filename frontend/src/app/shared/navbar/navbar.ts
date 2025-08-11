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

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
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
}