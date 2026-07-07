import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, DashboardData } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiService) {}

  getDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.api.get<DashboardData>('dashboard');
  }
}
