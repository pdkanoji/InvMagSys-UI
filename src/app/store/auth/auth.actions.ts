import { createAction, props } from '@ngrx/store';
import { LoginRequest, LoginResponse, User } from '../../core/models/auth.model';

export const login = createAction('[Auth] Login', props<{ credentials: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ response: LoginResponse }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

export const loadUser = createAction('[Auth] Load User');
export const loadUserSuccess = createAction('[Auth] Load User Success', props<{ user: User; accessToken: string; refreshToken: string }>());

export const forgotPassword = createAction('[Auth] Forgot Password', props<{ email: string }>());
export const forgotPasswordSuccess = createAction('[Auth] Forgot Password Success');
export const forgotPasswordFailure = createAction('[Auth] Forgot Password Failure', props<{ error: string }>());

export const clearError = createAction('[Auth] Clear Error');
