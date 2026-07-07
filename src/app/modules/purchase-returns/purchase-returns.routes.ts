import { Routes } from '@angular/router';
export const purchaseReturnRoutes: Routes = [
  { path: '', loadComponent: () => import('./purchase-returns-list/purchase-returns-list.component').then(m => m.PurchaseReturnsListComponent) },
  { path: 'new', loadComponent: () => import('./purchase-return-form/purchase-return-form.component').then(m => m.PurchaseReturnFormComponent) },
];
