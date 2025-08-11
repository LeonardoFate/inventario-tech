import { Routes } from '@angular/router';
import { LoginComponent } from './feature/login/login';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
