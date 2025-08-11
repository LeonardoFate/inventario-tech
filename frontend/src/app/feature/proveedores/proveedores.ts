import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Proveedor } from '../../models';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.scss']
})
export class Proveedores implements OnInit {
  proveedores: Proveedor[] = [];
  loading = true;
  error = '';

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.loading = true;
    this.dataService.getProveedores().subscribe({
      next: (response) => {
        this.proveedores = response.proveedores || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error cargando proveedores';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }
}