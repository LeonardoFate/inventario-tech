import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/AuthService';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ AuthGuard - Verificando autenticación para:', state.url);
  
  const isAuthenticated = authService.isAuthenticated();
  console.log('🛡️ AuthGuard - Usuario autenticado:', isAuthenticated);

  if (isAuthenticated) {
    console.log('✅ AuthGuard - Acceso permitido');
    return true;
  }

  console.log('❌ AuthGuard - Redirigiendo a login');
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('🛡️ RoleGuard - Verificando roles para:', state.url);
  
  const requiredRoles = route.data?.['roles'] as string[];
  const currentUser = authService.getCurrentUser();
  
  console.log('🛡️ RoleGuard - Roles requeridos:', requiredRoles);
  console.log('🛡️ RoleGuard - Usuario actual:', currentUser);
  console.log('🛡️ RoleGuard - Rol del usuario:', currentUser?.rol);
  
  if (!authService.isAuthenticated()) {
    console.log('❌ RoleGuard - Usuario no autenticado, redirigiendo a login');
    router.navigate(['/login']);
    return false;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = authService.hasRole(requiredRoles);
    console.log('🛡️ RoleGuard - Usuario tiene rol requerido:', hasRole);
    
    if (hasRole) {
      console.log('✅ RoleGuard - Acceso permitido');
      return true;
    } else {
      console.log('❌ RoleGuard - Rol insuficiente, redirigiendo a dashboard');
      // En lugar de unauthorized, redirigir al dashboard con un mensaje
      router.navigate(['/dashboard']);
      return false;
    }
  }

  console.log('✅ RoleGuard - Sin restricciones de rol, acceso permitido');
  return true;
};

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ LoginGuard - Verificando si ya está logueado');

  if (authService.isAuthenticated()) {
    console.log('✅ LoginGuard - Ya autenticado, redirigiendo a dashboard');
    router.navigate(['/dashboard']);
    return false;
  }
  
  console.log('✅ LoginGuard - No autenticado, puede acceder a login');
  return true;
};