import { createAction, props } from '@ngrx/store';
import { Role } from '../../core/models/role.model';

export const loadRoles = createAction('[Roles] Load', props<{ params?: Record<string, unknown> }>());
export const loadRolesSuccess = createAction('[Roles] Load Success', props<{ roles: Role[]; total: number; page: number; limit: number }>());
export const loadRolesFailure = createAction('[Roles] Load Failure', props<{ error: string }>());

export const loadRole = createAction('[Roles] Load One', props<{ id: string }>());
export const loadRoleSuccess = createAction('[Roles] Load One Success', props<{ role: Role }>());
export const loadRoleFailure = createAction('[Roles] Load One Failure', props<{ error: string }>());

export const createRole = createAction('[Roles] Create', props<{ body: Partial<Role> }>());
export const createRoleSuccess = createAction('[Roles] Create Success', props<{ role: Role }>());
export const createRoleFailure = createAction('[Roles] Create Failure', props<{ error: string }>());

export const updateRole = createAction('[Roles] Update', props<{ id: string; body: Partial<Role> }>());
export const updateRoleSuccess = createAction('[Roles] Update Success', props<{ role: Role }>());
export const updateRoleFailure = createAction('[Roles] Update Failure', props<{ error: string }>());

export const deleteRole = createAction('[Roles] Delete', props<{ id: string }>());
export const deleteRoleSuccess = createAction('[Roles] Delete Success', props<{ id: string }>());
export const deleteRoleFailure = createAction('[Roles] Delete Failure', props<{ error: string }>());

export const clearRoleError = createAction('[Roles] Clear Error');
export const clearSelectedRole = createAction('[Roles] Clear Selected');
