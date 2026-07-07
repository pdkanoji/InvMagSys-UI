import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/inventory.model';
import { PermissionsResponse } from '../models/permissions.model';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private api = inject(ApiService);

  getMyPermissions(): Observable<ApiResponse<PermissionsResponse>> {
    return this.api.get<PermissionsResponse>('permissions/my-permissions');
  }
}
