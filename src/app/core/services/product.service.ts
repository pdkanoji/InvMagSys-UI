import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginationParams, Product, ProductImportSummary } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  getAll(params: PaginationParams & Record<string, unknown> = {}): Observable<ApiResponse<Product[]>> {
    return this.api.get<Product[]>('products', params);
  }

  getById(id: string): Observable<ApiResponse<Product>> {
    return this.api.get<Product>(`products/${id}`);
  }

  create(formData: FormData): Observable<ApiResponse<Product>> {
    return this.api.postFormData<Product>('products', formData);
  }

  update(id: string, formData: FormData): Observable<ApiResponse<Product>> {
    return this.api.putFormData<Product>(`products/${id}`, formData);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`products/${id}`);
  }

  export(): Observable<Blob> {
    return this.api.getBlob('products/export');
  }

  downloadSample(): Observable<Blob> {
    return this.api.getBlob('products/import-sample');
  }

  import(file: File): Observable<ApiResponse<ProductImportSummary>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData<ProductImportSummary>('products/bulk-import', formData);
  }
}
