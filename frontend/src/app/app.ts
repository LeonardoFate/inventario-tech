import { Component } from '@angular/core';
import { NavbarComponent } from './shared/navbar/navbar';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  constructor(private router: Router) {}

  get mostrarNavbar() {
    return this.router.url !== '/login';
  }
}