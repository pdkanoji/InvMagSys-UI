import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { authReducer } from './auth/auth.reducer';
import { productReducer } from './product/product.reducer';
import { permissionsReducer, PermissionsState } from './permissions/permissions.reducer';
import { rolesReducer } from './roles/roles.reducer';
import { AuthState } from '../core/models/auth.model';
import { ProductState } from './product/product.reducer';
import { RolesState } from '../core/models/role.model';

export interface AppState {
  auth: AuthState;
  products: ProductState;
  permissions: PermissionsState;
  roles: RolesState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  products: productReducer,
  permissions: permissionsReducer,
  roles: rolesReducer,
};

export const metaReducers: MetaReducer<AppState>[] = [];
