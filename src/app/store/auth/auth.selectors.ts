import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from '../../core/models/auth.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectCurrentUser = createSelector(selectAuthState, s => s.user);
export const selectAccessToken = createSelector(selectAuthState, s => s.accessToken);
export const selectIsAuthenticated = createSelector(selectAuthState, s => !!s.accessToken);
export const selectAuthLoading = createSelector(selectAuthState, s => s.isLoading);
export const selectAuthError = createSelector(selectAuthState, s => s.error);
export const selectUserRole = createSelector(selectCurrentUser, user => user?.roles?.name);
