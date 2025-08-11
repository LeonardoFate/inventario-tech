import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  nombreUsuario = '';
  password = '';
  error = '';
  loading = false;
  returnUrl = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  login() {
    if (!this.nombreUsuario || !this.password) {
      this.error = 'Por favor ingrese usuario y contraseña';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({ 
      nombreUsuario: this.nombreUsuario, 
      password: this.password 
    }).subscribe({
      next: (response) => {
        // Verificar si el login fue exitoso por la presencia del token
        if (response.token) {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (error) => {
        this.error = error.error?.message || 'Usuario o contraseña incorrectos';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}