import { createReducer, on } from '@ngrx/store';
import { AuthState } from '../../core/models/auth.model';
import * as AuthActions from './auth.actions';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.loadUserSuccess, (state, { user, accessToken, refreshToken }) => ({
    ...state, user, accessToken, refreshToken,
  })),
  on(AuthActions.login, state => ({ ...state, isLoading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    isLoading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state, isLoading: false, error,
  })),
  on(AuthActions.logout, state => state),
  on(AuthActions.logoutSuccess, () => initialState),
  //on(AuthActions.logout, AuthActions.logoutSuccess, () => initialState),
  on(AuthActions.forgotPassword, state => ({ ...state, isLoading: true, error: null })),
  on(AuthActions.forgotPasswordSuccess, state => ({ ...state, isLoading: false })),
  on(AuthActions.forgotPasswordFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
  on(AuthActions.clearError, state => ({ ...state, error: null })),
);
