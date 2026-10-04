export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type ModulePermissions = Record<string, ModulePermission>;
export type PermissionAction = keyof ModulePermission;

export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
  actions: PermissionAction[];
}

export interface PermissionsResponse {
  role: string;
  permissions: ModulePermissions;
}

export const AVAILABLE_PERMISSION_MODULES: PermissionDefinition[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'Overview and summary views', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'products', label: 'Products', description: 'Catalog and inventory items', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'categories', label: 'Categories', description: 'Item categorization', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'inventory', label: 'Inventory', description: 'Stock movement and counts', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'purchases', label: 'Purchases', description: 'Purchase orders and records', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'purchase_returns', label: 'Purchase Returns', description: 'Return and reversal flows', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'sales', label: 'Sales', description: 'Sales orders and invoices', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'sale_returns', label: 'Sale Returns', description: 'Customer return handling', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'suppliers', label: 'Suppliers', description: 'Vendor records', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'customers', label: 'Customers', description: 'Customer accounts', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'warehouses', label: 'Warehouses', description: 'Locations and stock allocation', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'reports', label: 'Reports', description: 'Reporting and analytics', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'users', label: 'Users', description: 'User account management', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'roles', label: 'Roles', description: 'Role management and assignment', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'audit_logs', label: 'Audit Logs', description: 'System change history', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'notifications', label: 'Notifications', description: 'Alerts and reminders', actions: ['view', 'create', 'edit', 'delete'] },
];

export const normalizeModulePermissions = (raw: Partial<ModulePermissions> = {}): ModulePermissions => {
  const normalized: ModulePermissions = {};

  for (const definition of AVAILABLE_PERMISSION_MODULES) {
    const current = (raw[definition.key] || {}) as Partial<ModulePermission>;
    normalized[definition.key] = {
      view: !!current.view,
      create: !!current.create,
      edit: !!current.edit,
      delete: !!current.delete,
    };
  }

  return normalized;
};
