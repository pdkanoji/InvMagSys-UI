import { Routes } from '@angular/router';
export const purchaseRoutes: Routes = [
  { path: '', loadComponent: () => import('./purchases-list/purchases-list.component').then(m => m.PurchasesListComponent) },
  { path: 'new', loadComponent: () => import('./purchase-form/purchase-form.component').then(m => m.PurchaseFormComponent) },
  { path: ':id', loadComponent: () => import('./purchase-detail/purchase-detail.component').then(m => m.PurchaseDetailComponent) },
];
