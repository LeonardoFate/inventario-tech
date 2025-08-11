import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/AuthService';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRoles = route.data?.['roles'] as string[];
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (authService.hasRole(requiredRoles)) {
      return true;
    } else {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};