import { createReducer, on } from '@ngrx/store';
import { RolesState } from '../../core/models/role.model';
import * as RolesActions from './roles.actions';

const initialState: RolesState = {
  roles: [],
  selectedRole: null,
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  error: null,
};

export const rolesReducer = createReducer(
  initialState,
  on(RolesActions.loadRoles, RolesActions.loadRole, state => ({ ...state, loading: true, error: null })),

  on(RolesActions.loadRolesSuccess, (state, { roles, total, page, limit }) => ({
    ...state, roles, total, page, limit, loading: false,
  })),
  on(RolesActions.loadRoleSuccess, (state, { role }) => ({
    ...state, selectedRole: role, loading: false,
  })),

  on(RolesActions.createRoleSuccess, (state, { role }) => ({
    ...state, roles: [role, ...state.roles], total: state.total + 1, loading: false,
  })),
  on(RolesActions.updateRoleSuccess, (state, { role }) => ({
    ...state,
    roles: state.roles.map(r => r.id === role.id ? role : r),
    selectedRole: role,
    loading: false,
  })),
  on(RolesActions.deleteRoleSuccess, (state, { id }) => ({
    ...state,
    roles: state.roles.filter(r => r.id !== id),
    total: state.total - 1,
    loading: false,
  })),

  on(
    RolesActions.loadRolesFailure,
    RolesActions.loadRoleFailure,
    RolesActions.createRoleFailure,
    RolesActions.updateRoleFailure,
    RolesActions.deleteRoleFailure,
    (state, { error }) => ({ ...state, loading: false, error }),
  ),

  on(RolesActions.clearRoleError, state => ({ ...state, error: null })),
  on(RolesActions.clearSelectedRole, state => ({ ...state, selectedRole: null })),
);
