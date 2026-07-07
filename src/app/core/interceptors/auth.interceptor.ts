import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { switchMap, take } from 'rxjs/operators';
import { selectAccessToken } from '../../store/auth/auth.selectors';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const store = inject(Store);
  return store.select(selectAccessToken).pipe(
    take(1),
    switchMap(token => {
      const accessToken = token || localStorage.getItem('accessToken');
      if (accessToken) {
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${accessToken}` },
        });
        return next(cloned);
      }
      return next(req);
    }),
  );
};
