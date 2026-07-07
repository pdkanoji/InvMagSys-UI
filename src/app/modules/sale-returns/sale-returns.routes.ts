import { Routes } from '@angular/router';
export const saleReturnRoutes: Routes = [
  { path: '', loadComponent: () => import('./sale-returns-list/sale-returns-list.component').then(m => m.SaleReturnsListComponent) },
  { path: 'new', loadComponent: () => import('./sale-return-form/sale-return-form.component').then(m => m.SaleReturnFormComponent) },
];
