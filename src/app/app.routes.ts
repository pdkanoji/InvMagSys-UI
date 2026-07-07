import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'products',
        loadChildren: () => import('./modules/products/products.routes').then(m => m.productRoutes),
      },
      {
        path: 'categories',
        loadChildren: () => import('./modules/categories/categories.routes').then(m => m.categoryRoutes),
      },
      {
        path: 'suppliers',
        loadChildren: () => import('./modules/suppliers/suppliers.routes').then(m => m.supplierRoutes),
      },
      {
        path: 'customers',
        loadChildren: () => import('./modules/customers/customers.routes').then(m => m.customerRoutes),
      },
      {
        path: 'purchases',
        loadChildren: () => import('./modules/purchases/purchases.routes').then(m => m.purchaseRoutes),
      },
      {
        path: 'purchase-returns',
        loadChildren: () => import('./modules/purchase-returns/purchase-returns.routes').then(m => m.purchaseReturnRoutes),
      },
      {
        path: 'sales',
        loadChildren: () => import('./modules/sales/sales.routes').then(m => m.saleRoutes),
      },
      {
        path: 'sale-returns',
        loadChildren: () => import('./modules/sale-returns/sale-returns.routes').then(m => m.saleReturnRoutes),
      },
      {
        path: 'inventory',
        loadChildren: () => import('./modules/inventory/inventory.routes').then(m => m.inventoryRoutes),
      },
      {
        path: 'warehouses',
        loadChildren: () => import('./modules/warehouses/warehouses.routes').then(m => m.warehouseRoutes),
      },
      {
        path: 'reports',
        loadChildren: () => import('./modules/reports/reports.routes').then(m => m.reportRoutes),
        canActivate: [roleGuard],
        data: { roles: ['super_admin', 'admin', 'manager'] },
      },
      {
        path: 'roles',
        loadChildren: () => import('./modules/roles/roles.routes').then(m => m.rolesRoutes),
        canActivate: [roleGuard],
        data: { roles: ['super_admin', 'admin'] },
      },
      {
        path: 'users',
        loadChildren: () => import('./modules/users/users.routes').then(m => m.userRoutes),
        canActivate: [roleGuard],
        data: { roles: ['super_admin', 'admin'] },
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./modules/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
        canActivate: [roleGuard],
        data: { roles: ['super_admin', 'admin'] },
      },
      {
        path: 'notifications',
        loadComponent: () => import('./modules/notifications/notifications.component').then(m => m.NotificationsComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./modules/profile/profile.component').then(m => m.ProfileComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
