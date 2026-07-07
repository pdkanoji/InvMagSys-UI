import { Routes } from '@angular/router';
export const supplierRoutes: Routes = [
  { path: '', loadComponent: () => import('./suppliers-list/suppliers-list.component').then(m => m.SuppliersListComponent) },
  { path: 'new', loadComponent: () => import('./supplier-form/supplier-form.component').then(m => m.SupplierFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./supplier-form/supplier-form.component').then(m => m.SupplierFormComponent) },
];
