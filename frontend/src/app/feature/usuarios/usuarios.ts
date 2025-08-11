import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class Usuarios implements OnInit {
  
  constructor() {}

  ngOnInit() {
    // Implementar gestión de usuarios
  }
}
