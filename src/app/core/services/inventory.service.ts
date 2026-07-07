import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginationParams } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private api: ApiService) {}

  getInventory(params: PaginationParams & Record<string, unknown> = {}): Observable<ApiResponse<unknown[]>> {
    return this.api.get<unknown[]>('inventory', params);
  }

  getTransactions(params: Record<string, unknown> = {}): Observable<ApiResponse<unknown[]>> {
    return this.api.get<unknown[]>('inventory/transactions', params);
  }

  stockIn(data: { product_id: string; warehouse_id: string; quantity: number; notes?: string }): Observable<ApiResponse<null>> {
    return this.api.post<null>('inventory/stock-in', data);
  }

  stockOut(data: { product_id: string; warehouse_id: string; quantity: number; notes?: string }): Observable<ApiResponse<null>> {
    return this.api.post<null>('inventory/stock-out', data);
  }

  adjustment(data: { product_id: string; warehouse_id: string; new_quantity: number; notes?: string }): Observable<ApiResponse<null>> {
    return this.api.post<null>('inventory/adjustment', data);
  }

  transfer(data: { from_warehouse_id: string; to_warehouse_id: string; items: unknown[]; notes?: string }): Observable<ApiResponse<unknown>> {
    return this.api.post<unknown>('inventory/transfer', data);
  }
}
