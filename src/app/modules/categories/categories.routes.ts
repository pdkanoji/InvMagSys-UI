import { Routes } from '@angular/router';
export const categoryRoutes: Routes = [
  { path: '', loadComponent: () => import('./categories-list/categories-list.component').then(m => m.CategoriesListComponent) },
  { path: 'new', loadComponent: () => import('./category-form/category-form.component').then(m => m.CategoryFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./category-form/category-form.component').then(m => m.CategoryFormComponent) },
];
