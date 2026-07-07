import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PermissionsState } from './permissions.reducer';

export const selectPermissionsState = createFeatureSelector<PermissionsState>('permissions');

export const selectPermissions = createSelector(selectPermissionsState, s => s.permissions);
export const selectPermissionsLoaded = createSelector(selectPermissionsState, s => s.isLoaded);
export const selectUserPermissionFor = (module: string) =>
  createSelector(selectPermissions, perms => perms[module] ?? { view: false, create: false, edit: false, delete: false });
