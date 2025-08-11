import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/AuthService';
import { Estadisticas, Usuario } from '../../models/index';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  estadisticas: Estadisticas | null = null;
  usuario: Usuario | null = null;
  loading = true;
  error = '';

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getCurrentUser();
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.loading = true;
    this.dataService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error cargando estadísticas';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }
}