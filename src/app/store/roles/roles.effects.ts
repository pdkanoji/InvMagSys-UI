import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as RolesActions from './roles.actions';
import { RolesService } from '../../core/services/roles.service';

@Injectable()
export class RolesEffects {
  private actions$ = inject(Actions);
  private rolesService = inject(RolesService);

  loadRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadRoles),
      switchMap(({ params }) =>
        this.rolesService.getAll(params || {}).pipe(
          map(res => RolesActions.loadRolesSuccess({
            roles: res.data,
            total: res.meta?.total || 0,
            page: res.meta?.page || 1,
            limit: res.meta?.limit || 20,
          })),
          catchError(err => of(RolesActions.loadRolesFailure({ error: err.error?.message || 'Load failed' }))),
        ),
      ),
    ),
  );

  loadRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadRole),
      switchMap(({ id }) =>
        this.rolesService.getById(id).pipe(
          map(res => RolesActions.loadRoleSuccess({ role: res.data })),
          catchError(err => of(RolesActions.loadRoleFailure({ error: err.error?.message || 'Load failed' }))),
        ),
      ),
    ),
  );

  createRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.createRole),
      switchMap(({ body }) =>
        this.rolesService.create(body).pipe(
          map(res => RolesActions.createRoleSuccess({ role: res.data })),
          catchError(err => of(RolesActions.createRoleFailure({ error: err.error?.message || 'Create failed' }))),
        ),
      ),
    ),
  );

  updateRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.updateRole),
      switchMap(({ id, body }) =>
        this.rolesService.update(id, body).pipe(
          map(res => RolesActions.updateRoleSuccess({ role: res.data })),
          catchError(err => of(RolesActions.updateRoleFailure({ error: err.error?.message || 'Update failed' }))),
        ),
      ),
    ),
  );

  deleteRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.deleteRole),
      switchMap(({ id }) =>
        this.rolesService.delete(id).pipe(
          map(() => RolesActions.deleteRoleSuccess({ id })),
          catchError(err => of(RolesActions.deleteRoleFailure({ error: err.error?.message || 'Delete failed' }))),
        ),
      ),
    ),
  );
}
