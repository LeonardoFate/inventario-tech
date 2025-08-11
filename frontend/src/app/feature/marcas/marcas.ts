import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Marca } from '../../models';

@Component({
  selector: 'app-marcas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marcas.html',
  styleUrls: ['./marcas.scss']
})
export class Marcas implements OnInit {
  marcas: Marca[] = [];
  loading = true;
  error = '';
  
  mostrarModal = false;
  marcaActual: Partial<Marca> = {};

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.cargarMarcas();
  }

  cargarMarcas() {
    this.loading = true;
    this.dataService.getMarcas().subscribe({
      next: (response) => {
        this.marcas = response.marcas || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error cargando marcas';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  nuevaMarca() {
    this.marcaActual = {};
    this.mostrarModal = true;
  }

  guardarMarca() {
    this.dataService.crearMarca(this.marcaActual as any).subscribe({
      next: () => {
        this.mostrarModal = false;
        this.cargarMarcas();
      },
      error: (error) => {
        console.error('Error guardando marca:', error);
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.marcaActual = {};
  }
}