export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type ModulePermissions = Record<string, ModulePermission>;

export interface PermissionsResponse {
  role: string;
  permissions: ModulePermissions;
}
