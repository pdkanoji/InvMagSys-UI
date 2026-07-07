import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as PermissionsActions from './permissions.actions';
import { PermissionsService } from '../../core/services/permissions.service';

@Injectable()
export class PermissionsEffects {
  private actions$ = inject(Actions);
  private permissionsService = inject(PermissionsService);

  loadPermissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PermissionsActions.loadPermissions),
      switchMap(() =>
        this.permissionsService.getMyPermissions().pipe(
          map(res => PermissionsActions.loadPermissionsSuccess({
            role: res.data.role,
            permissions: res.data.permissions,
          })),
          catchError(err => of(PermissionsActions.loadPermissionsFailure({
            error: err.error?.message || 'Failed to load permissions',
          }))),
        ),
      ),
    ),
  );
}
