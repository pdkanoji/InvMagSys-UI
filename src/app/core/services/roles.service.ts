import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/inventory.model';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private api = inject(ApiService);

  getAll(params: Record<string, unknown> = {}): Observable<ApiResponse<Role[]>> {
    return this.api.get<Role[]>('roles', params);
  }

  getById(id: string): Observable<ApiResponse<Role>> {
    return this.api.get<Role>(`roles/${id}`);
  }

  create(body: Partial<Role>): Observable<ApiResponse<Role>> {
    return this.api.post<Role>('roles', body);
  }

  update(id: string, body: Partial<Role>): Observable<ApiResponse<Role>> {
    return this.api.put<Role>(`roles/${id}`, body);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`roles/${id}`);
  }
}
