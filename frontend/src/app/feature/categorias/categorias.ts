import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Categoria } from '../../models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.scss']
})
export class Categorias implements OnInit {
  categorias: Categoria[] = [];
  loading = true;
  error = '';
  
  // Modal
  mostrarModal = false;
  categoriaActual: Partial<Categoria> = {};
  editando = false;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.loading = true;
    this.dataService.getCategorias().subscribe({
      next: (response) => {
        this.categorias = response.categorias || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error cargando categorías';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  nuevaCategoria() {
    this.categoriaActual = {};
    this.editando = false;
    this.mostrarModal = true;
  }

  guardarCategoria() {
    this.dataService.crearCategoria(this.categoriaActual as any).subscribe({
      next: () => {
        this.mostrarModal = false;
        this.cargarCategorias();
      },
      error: (error) => {
        console.error('Error guardando categoría:', error);
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.categoriaActual = {};
  }
}