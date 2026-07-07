import { Routes } from '@angular/router';
export const warehouseRoutes: Routes = [
  { path: '', loadComponent: () => import('./warehouses-list/warehouses-list.component').then(m => m.WarehousesListComponent) },
  { path: 'new', loadComponent: () => import('./warehouse-form/warehouse-form.component').then(m => m.WarehouseFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./warehouse-form/warehouse-form.component').then(m => m.WarehouseFormComponent) },
];
