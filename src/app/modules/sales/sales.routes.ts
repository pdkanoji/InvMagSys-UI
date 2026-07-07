import { Routes } from '@angular/router';
export const saleRoutes: Routes = [
  { path: '', loadComponent: () => import('./sales-list/sales-list.component').then(m => m.SalesListComponent) },
  { path: 'new', loadComponent: () => import('./sale-form/sale-form.component').then(m => m.SaleFormComponent) },
  { path: ':id', loadComponent: () => import('./sale-detail/sale-detail.component').then(m => m.SaleDetailComponent) },
];
