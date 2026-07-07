import { Routes } from '@angular/router';
export const inventoryRoutes: Routes = [
  { path: '', loadComponent: () => import('./inventory-list/inventory-list.component').then(m => m.InventoryListComponent) },
  { path: 'transactions', loadComponent: () => import('./transactions/transactions.component').then(m => m.TransactionsComponent) },
];
