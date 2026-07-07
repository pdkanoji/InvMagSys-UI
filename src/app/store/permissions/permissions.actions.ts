import { createAction, props } from '@ngrx/store';
import { ModulePermissions } from '../../core/models/permissions.model';

export const loadPermissions = createAction('[Permissions] Load');
export const loadPermissionsSuccess = createAction(
  '[Permissions] Load Success',
  props<{ role: string; permissions: ModulePermissions }>(),
);
export const loadPermissionsFailure = createAction(
  '[Permissions] Load Failure',
  props<{ error: string }>(),
);
export const clearPermissions = createAction('[Permissions] Clear');
