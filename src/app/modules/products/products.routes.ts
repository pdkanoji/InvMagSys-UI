import { Routes } from '@angular/router';
export const productRoutes: Routes = [
  { path: '', loadComponent: () => import('./products-list/products-list.component').then(m => m.ProductsListComponent) },
  { path: 'import', loadComponent: () => import('./product-import/product-import.component').then(m => m.ProductImportComponent) },
  { path: 'new', loadComponent: () => import('./product-form/product-form.component').then(m => m.ProductFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./product-form/product-form.component').then(m => m.ProductFormComponent) },
];
