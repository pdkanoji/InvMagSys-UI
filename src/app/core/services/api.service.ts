import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginationParams } from '../models/inventory.model';
import { LoadingService } from './loading.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  private loading = inject(LoadingService);
  constructor(private http: HttpClient) {}

  private buildParams(params: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== null && val !== undefined && val !== '') {
        httpParams = httpParams.set(key, String(val));
      }
    }
    return httpParams;
  }

  get<T>(endpoint: string, params: Record<string, unknown> = {}): Observable<ApiResponse<T>> {
    this.loading.show();
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, {
      params: this.buildParams(params),
    }).pipe(finalize(() => this.loading.hide()));
  }

  post<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    this.loading.show();
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body).pipe(finalize(() => this.loading.hide()));
  }

  put<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    this.loading.show();
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body).pipe(finalize(() => this.loading.hide()));
  }

  patch<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    this.loading.show();
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body).pipe(finalize(() => this.loading.hide()));
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    this.loading.show();
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`).pipe(finalize(() => this.loading.hide()));
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<ApiResponse<T>> {
    this.loading.show();
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, formData).pipe(finalize(() => this.loading.hide()));
  }

  putFormData<T>(endpoint: string, formData: FormData): Observable<ApiResponse<T>> {
    this.loading.show();
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, formData).pipe(finalize(() => this.loading.hide()));
  }

  getBlob(endpoint: string): Observable<Blob> {
    this.loading.show();
    return this.http.get(`${this.baseUrl}/${endpoint}`, { responseType: 'blob' }).pipe(finalize(() => this.loading.hide()));
  }
}
