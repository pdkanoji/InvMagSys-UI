import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUser),
      map(() => {
        const token = this.authService.getStoredToken();
        const user = this.authService.getStoredUser() as User;
        const refreshToken = localStorage.getItem('refreshToken');
        if (token && user) {
          return AuthActions.loadUserSuccess({ user, accessToken: token, refreshToken: refreshToken || '' });
        }
        return AuthActions.logoutSuccess();
      }),
    ),
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map(res => AuthActions.loginSuccess({ response: res.data })),
          catchError(err => of(AuthActions.loginFailure({ error: err.error?.message || 'Login failed' }))),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => this.router.navigate(['/dashboard'])),
    ),
    { dispatch: false },
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() => {
        const token = this.authService.getStoredToken();
        if (!token) {
          return of(AuthActions.logoutSuccess());
        }
        return this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess())),
        );
      }),
    ),
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => {
        this.authService.clearStorage();
        this.router.navigate(['/auth/login']);
      }),
    ),
    { dispatch: false },
  );

  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPassword),
      switchMap(({ email }) =>
        this.authService.forgotPassword(email).pipe(
          map(() => AuthActions.forgotPasswordSuccess()),
          catchError(err => of(AuthActions.forgotPasswordFailure({ error: err.error?.message || 'Request failed' }))),
        ),
      ),
    ),
  );
}
