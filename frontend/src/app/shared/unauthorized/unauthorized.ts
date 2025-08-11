import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="unauthorized-container">
      <h2>Acceso No Autorizado</h2>
      <p>No tienes permisos para acceder a esta página.</p>
      <a routerLink="/dashboard" class="back-btn">Volver al Dashboard</a>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      text-align: center;
      padding: 50px;
    }
    .back-btn {
      display: inline-block;
      padding: 10px 20px;
      background: #1976d2;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
    }
  `]
})
export class UnauthorizedComponent {}