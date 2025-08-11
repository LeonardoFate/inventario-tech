import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Ubicacion } from '../../models';

@Component({
  selector: 'app-ubicaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ubicaciones.html',
  styleUrls: ['./ubicaciones.scss']
})
export class Ubicaciones implements OnInit {
  ubicaciones: Ubicacion[] = [];
  loading = true;
  error = '';

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.cargarUbicaciones();
  }

  cargarUbicaciones() {
    this.loading = true;
    this.dataService.getUbicaciones().subscribe({
      next: (response) => {
        this.ubicaciones = response.ubicaciones || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error cargando ubicaciones';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }
}
