// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './feature/login/login';
import { Dashboard } from './feature/dashboard/dashboard';
import { Dispositivos } from './feature/dispositivos/dispositivos';
import { DispositivoDetalleComponent } from './feature/dispositivos/dispositivos-detalle';
import { Categorias } from './feature/categorias/categorias';
import { Marcas } from './feature/marcas/marcas';
import { Ubicaciones } from './feature/ubicaciones/ubicaciones';
import { Proveedores } from './feature/proveedores/proveedores';
import { Usuarios } from './feature/usuarios/usuarios';
import { AsignacionesComponent } from './feature/asignaciones/asignaciones';
import { ReportesComponent } from './feature/reportes/reportes';
import { PerfilComponent } from './feature/perfil/perfil';
import { UnauthorizedComponent } from './shared/unauthorized/unauthorized';
import { authGuard, roleGuard, loginGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Ruta de login
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [loginGuard]
  },
  
  // Dashboard - accesible para todos los usuarios autenticados
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [authGuard]
  },
  
  // Dispositivos - accesible para todos los roles
  { 
    path: 'dispositivos', 
    component: Dispositivos,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador', 'Gerente', 'Tecnico', 'Empleado'] }
  },
  
  // Detalle de dispositivo - accesible para todos los roles
  { 
    path: 'dispositivos/:id', 
    component: DispositivoDetalleComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador', 'Gerente', 'Tecnico', 'Empleado'] }
  },
  
  // Asignaciones - accesible para roles superiores
  { 
    path: 'asignaciones', 
    component: AsignacionesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador', 'Gerente', 'Tecnico'] }
  },
  
  // Reportes - accesible para roles superiores
  { 
    path: 'reportes', 
    component: ReportesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador', 'Gerente'] }
  },
  
  // Catálogos - solo para Admin y Gerente
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
  
  // Perfil de usuario - accesible para todos los usuarios autenticados
  { 
    path: 'perfil', 
    component: PerfilComponent,
    canActivate: [authGuard]
  },
  
  // Usuarios - solo para Administradores
  { 
    path: 'usuarios', 
    component: Usuarios,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Administrador'] }
  },
  
  // Página de acceso no autorizado
  { 
    path: 'unauthorized', 
    component: UnauthorizedComponent
  },
  
  // Redirección por defecto
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  
  // Ruta comodín para páginas no encontradas
  { 
    path: '**', 
    redirectTo: '/dashboard'
  },

  { 
  path: 'dispositivos/:id', 
  component: DispositivoDetalleComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Administrador', 'Gerente', 'Tecnico', 'Empleado'] }
}
];