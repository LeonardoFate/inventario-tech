import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  token = '';

  constructor(private auth: AuthService) {}

  login() {
    this.auth.login({ nombreUsuario: this.nombreUsuario, password: this.password })
      .subscribe({
        next: (res) => {
          this.token = res.token;
          this.error = '';
        },
        error: () => {
          this.error = 'Usuario o contraseña incorrectos';
        }
      });
  }
}