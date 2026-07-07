import { Routes } from '@angular/router';
export const customerRoutes: Routes = [
  { path: '', loadComponent: () => import('./customers-list/customers-list.component').then(m => m.CustomersListComponent) },
  { path: 'new', loadComponent: () => import('./customer-form/customer-form.component').then(m => m.CustomerFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./customer-form/customer-form.component').then(m => m.CustomerFormComponent) },
];
