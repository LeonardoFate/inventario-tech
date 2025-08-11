import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from './shared/navbar/navbar';
import { NotificationComponent } from './shared/notifications/notification.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/AuthService';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, NotificationComponent, RouterOutlet],
  template: `
    <header>
      <h1>Sistema de Inventario</h1>
    </header>
    <app-navbar *ngIf="mostrarNavbar" />
    <main>
      <router-outlet />
    </main>
    <app-notifications />
  `,
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  mostrarNavbar = false;
  isAuthenticated = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de autenticación
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      this.updateNavbarVisibility();
    });

    // Suscribirse a cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateNavbarVisibility();
      });
  }

  private updateNavbarVisibility() {
    this.mostrarNavbar = this.isAuthenticated && this.router.url !== '/login';
  }
}