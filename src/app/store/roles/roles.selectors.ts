import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RolesState } from '../../core/models/role.model';

export const selectRolesState = createFeatureSelector<RolesState>('roles');

export const selectRoles = createSelector(selectRolesState, s => s.roles);
export const selectRolesLoading = createSelector(selectRolesState, s => s.loading);
export const selectRolesError = createSelector(selectRolesState, s => s.error);
export const selectRolesTotal = createSelector(selectRolesState, s => s.total);
export const selectSelectedRole = createSelector(selectRolesState, s => s.selectedRole);
