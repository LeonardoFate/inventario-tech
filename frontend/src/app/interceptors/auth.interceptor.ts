import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/AuthService';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  const publicEndpoints = ['/auth/login', '/auth/register', '/auth/setup', '/test'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  if (!isPublicEndpoint && authService.getToken()) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authService.getToken()}`)
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        authService.logout().subscribe();
      }
      return throwError(() => error);
    })
  );
};