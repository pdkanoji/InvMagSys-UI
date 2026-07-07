import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { logout } from '../../store/auth/auth.actions';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isPublicAuthEndpoint =
          req.url.includes('/auth/login') ||
          req.url.includes('/auth/logout') ||
          req.url.includes('/auth/refresh-token') ||
          req.url.includes('/auth/forgot-password') ||
          req.url.includes('/auth/reset-password');

        if (!isPublicAuthEndpoint) {
          store.dispatch(logout());
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};
