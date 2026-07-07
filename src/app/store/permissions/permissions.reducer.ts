import { createReducer, on } from '@ngrx/store';
import { ModulePermissions } from '../../core/models/permissions.model';
import * as PermissionsActions from './permissions.actions';

export interface PermissionsState {
  role: string | null;
  permissions: ModulePermissions;
  isLoaded: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  role: null,
  permissions: {},
  isLoaded: false,
  error: null,
};

export const permissionsReducer = createReducer(
  initialState,
  on(PermissionsActions.loadPermissions, state => ({ ...state, error: null })),
  on(PermissionsActions.loadPermissionsSuccess, (state, { role, permissions }) => ({
    ...state, role, permissions, isLoaded: true, error: null,
  })),
  on(PermissionsActions.loadPermissionsFailure, (state, { error }) => ({
    ...state, isLoaded: true, error,
  })),
  on(PermissionsActions.clearPermissions, () => initialState),
);
