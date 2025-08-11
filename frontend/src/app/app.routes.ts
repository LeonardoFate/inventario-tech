import { Routes } from '@angular/router';
import { LoginComponent } from './feature/login/login';
import { Dashboard } from './feature/dashboard/dashboard';
import { Dispositivos } from './feature/dispositivos/dispositivos';
import { Categorias } from './feature/categorias/categorias';
import { Marcas } from './feature/marcas/marcas';
import { Ubicaciones } from './feature/ubicaciones/ubicaciones';
import { Proveedores } from './feature/proveedores/proveedores';
import { Usuarios } from './feature/usuarios/usuarios';
import { authGuard, roleGuard, loginGuard } from './guards/auth-guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [loginGuard]
  },
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [authGuard]
  },
  { 
    path: 'dispositivos', 
    component: Dispositivos,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador', 'Gerente', 'Tecnico'] }
  },
  { 
    path: 'categorias', 
    component: Categorias,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador', 'Gerente'] }
  },
  { 
    path: 'marcas', 
    component: Marcas,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador', 'Gerente'] }
  },
  { 
    path: 'ubicaciones', 
    component: Ubicaciones,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador', 'Gerente'] }
  },
  { 
    path: 'proveedores', 
    component: Proveedores,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador', 'Gerente'] }
  },
  { 
    path: 'usuarios', 
    component: Usuarios,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador'] }
  },
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];