import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { ApiResponse } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.api.post<LoginResponse>('auth/login', credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      }),
    );
  }

  logout(): Observable<ApiResponse<null>> {
    return this.api.post<null>('auth/logout', {}).pipe(
      tap(() => this.clearStorage()),
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<null>> {
    return this.api.post<null>('auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Observable<ApiResponse<null>> {
    return this.api.post<null>('auth/reset-password', { token, password });
  }

  getProfile(): Observable<ApiResponse<unknown>> {
    return this.api.get('auth/profile');
  }

  updateProfile(formData: FormData): Observable<ApiResponse<unknown>> {
    return this.api.putFormData('auth/profile', formData);
  }

  changePassword(current_password: string, new_password: string): Observable<ApiResponse<null>> {
    return this.api.put<null>('auth/change-password', { current_password, new_password });
  }

  getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getStoredUser(): unknown {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  clearStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}
