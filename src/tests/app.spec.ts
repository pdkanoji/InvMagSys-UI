import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { AuthEffects } from '../app/store/auth/auth.effects';
import { authReducer } from '../app/store/auth/auth.reducer';
import * as AuthActions from '../app/store/auth/auth.actions';
import { selectIsAuthenticated, selectAuthError, selectCurrentUser } from '../app/store/auth/auth.selectors';
import { productReducer } from '../app/store/product/product.reducer';
import * as ProductActions from '../app/store/product/product.actions';
import { selectProducts, selectProductLoading } from '../app/store/product/product.selectors';
import { ApiService } from '../app/core/services/api.service';
import { AuthService } from '../app/core/services/auth.service';
import { ProductService } from '../app/core/services/product.service';
import { InventoryService } from '../app/core/services/inventory.service';

/* ---- Auth Reducer Tests ---- */
describe('Auth Reducer', () => {
  it('should return initial state', () => {
    const state = authReducer(undefined, { type: '@@INIT' } as unknown as ReturnType<typeof AuthActions.login>);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isLoading).toBeFalse();
    expect(state.error).toBeNull();
  });

  it('should set isLoading on login', () => {
    const state = authReducer(undefined, AuthActions.login({ credentials: { email: 'test@test.com', password: 'pass' } }));
    expect(state.isLoading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('should set user and tokens on loginSuccess', () => {
    const mockResponse = {
      user: { id: '1', email: 'test@test.com', first_name: 'Test', last_name: 'User', role_id: 'r1', is_active: true, created_at: '' },
      accessToken: 'token123',
      refreshToken: 'refresh123',
    };
    const state = authReducer(undefined, AuthActions.loginSuccess({ response: mockResponse }));
    expect(state.user).toEqual(mockResponse.user);
    expect(state.accessToken).toBe('token123');
    expect(state.isLoading).toBeFalse();
  });

  it('should set error on loginFailure', () => {
    const state = authReducer(undefined, AuthActions.loginFailure({ error: 'Invalid credentials' }));
    expect(state.error).toBe('Invalid credentials');
    expect(state.isLoading).toBeFalse();
  });

  it('should clear state on logout', () => {
    const loggedInState = {
      user: { id: '1', email: 'test@test.com', first_name: 'T', last_name: 'U', role_id: 'r1', is_active: true, created_at: '' },
      accessToken: 'token', refreshToken: 'refresh', isLoading: false, error: null,
    };
    const state = authReducer(loggedInState, AuthActions.logout());
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it('should clear error on clearError', () => {
    const stateWithError = { user: null, accessToken: null, refreshToken: null, isLoading: false, error: 'Some error' };
    const state = authReducer(stateWithError, AuthActions.clearError());
    expect(state.error).toBeNull();
  });
});

/* ---- Auth Selectors Tests ---- */
describe('Auth Selectors', () => {
  const mockState = {
    auth: {
      user: { id: '1', email: 'admin@test.com', first_name: 'Admin', last_name: 'User', role_id: 'r1', is_active: true, created_at: '', roles: { id: 'r1', name: 'admin' } },
      accessToken: 'test_token',
      refreshToken: 'refresh',
      isLoading: false,
      error: null,
    },
  };

  it('selectIsAuthenticated should return true when token exists', () => {
    expect(selectIsAuthenticated.projector(mockState.auth)).toBeTrue();
  });

  it('selectIsAuthenticated should return false when no token', () => {
    expect(selectIsAuthenticated.projector({ ...mockState.auth, accessToken: null })).toBeFalse();
  });

  it('selectCurrentUser should return user', () => {
    expect(selectCurrentUser.projector(mockState.auth)).toEqual(mockState.auth.user);
  });

  it('selectAuthError should return error', () => {
    const stateWithError = { ...mockState.auth, error: 'Login failed' };
    expect(selectAuthError.projector(stateWithError)).toBe('Login failed');
  });
});

/* ---- Product Reducer Tests ---- */
describe('Product Reducer', () => {
  const mockProduct = {
    id: 'p1', code: 'PRD-001', name: 'Test Product', purchase_price: 100, selling_price: 150,
    tax_percentage: 18, reorder_level: 10, is_active: true, created_at: '',
  };

  it('should return initial state', () => {
    const state = productReducer(undefined, { type: '@@INIT' } as unknown as ReturnType<typeof ProductActions.loadProducts>);
    expect(state.products).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.isLoading).toBeFalse();
  });

  it('should set loading on loadProducts', () => {
    const state = productReducer(undefined, ProductActions.loadProducts({ params: {} }));
    expect(state.isLoading).toBeTrue();
  });

  it('should populate products on loadProductsSuccess', () => {
    const state = productReducer(undefined, ProductActions.loadProductsSuccess({ products: [mockProduct], total: 1, page: 1, limit: 20 }));
    expect(state.products).toContain(mockProduct);
    expect(state.total).toBe(1);
    expect(state.isLoading).toBeFalse();
  });

  it('should add product on createProductSuccess', () => {
    const state = productReducer(undefined, ProductActions.createProductSuccess({ product: mockProduct }));
    expect(state.products).toContain(mockProduct);
    expect(state.total).toBe(1);
  });

  it('should update product on updateProductSuccess', () => {
    const initial = { products: [mockProduct], selectedProduct: null, total: 1, page: 1, limit: 20, isLoading: false, error: null };
    const updated = { ...mockProduct, name: 'Updated Product' };
    const state = productReducer(initial, ProductActions.updateProductSuccess({ product: updated }));
    expect(state.products[0].name).toBe('Updated Product');
  });

  it('should remove product on deleteProductSuccess', () => {
    const initial = { products: [mockProduct], selectedProduct: null, total: 1, page: 1, limit: 20, isLoading: false, error: null };
    const state = productReducer(initial, ProductActions.deleteProductSuccess({ id: 'p1' }));
    expect(state.products.length).toBe(0);
    expect(state.total).toBe(0);
  });
});

/* ---- Product Selectors Tests ---- */
describe('Product Selectors', () => {
  const mockProduct = { id: 'p1', code: 'PRD-001', name: 'Test', purchase_price: 100, selling_price: 150, tax_percentage: 18, reorder_level: 10, is_active: true, created_at: '' };

  it('selectProducts should return products array', () => {
    const productState = { products: [mockProduct], selectedProduct: null, total: 1, page: 1, limit: 20, isLoading: false, error: null };
    expect(selectProducts.projector(productState)).toContain(mockProduct);
  });

  it('selectProductLoading should return loading state', () => {
    const productState = { products: [], selectedProduct: null, total: 0, page: 1, limit: 20, isLoading: true, error: null };
    expect(selectProductLoading.projector(productState)).toBeTrue();
  });
});

/* ---- ApiService Tests ---- */
describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('GET should call correct URL', () => {
    service.get('products').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/products'));
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [], message: 'OK' });
  });

  it('POST should send data', () => {
    const body = { name: 'Test Product' };
    service.post('products', body).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/products'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: body, message: 'Created' });
  });

  it('PUT should send data', () => {
    service.put('products/1', { name: 'Updated' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/products/1'));
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: {}, message: 'Updated' });
  });

  it('DELETE should call correct URL', () => {
    service.delete('products/1').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/products/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: null, message: 'Deleted' });
  });

  it('GET with params should include query string', () => {
    service.get('products', { page: 1, limit: 20, search: 'test' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/products') && r.params.has('search'));
    expect(req.request.params.get('search')).toBe('test');
    req.flush({ success: true, data: [], message: 'OK' });
  });
});

/* ---- AuthService Tests ---- */
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, AuthService],
    });
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated should return false when no token', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('isAuthenticated should return true when token exists', () => {
    localStorage.setItem('accessToken', 'test_token');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('getStoredToken should return token from localStorage', () => {
    localStorage.setItem('accessToken', 'my_token');
    expect(service.getStoredToken()).toBe('my_token');
  });

  it('clearStorage should remove auth data', () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('user', '{}');
    service.clearStorage();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('getStoredUser should return null when nothing in storage', () => {
    expect(service.getStoredUser()).toBeNull();
  });
});

/* ---- ProductService Tests ---- */
describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, ProductService],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getAll should call products endpoint', () => {
    service.getAll({}).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/products'));
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [], message: 'OK', meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  });

  it('getById should call products/:id', () => {
    service.getById('test-id').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/products/test-id'));
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: {}, message: 'OK' });
  });

  it('delete should call DELETE products/:id', () => {
    service.delete('test-id').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/products/test-id'));
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: null, message: 'Deleted' });
  });
});

/* ---- InventoryService Tests ---- */
describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, InventoryService],
    });
    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getInventory should call inventory endpoint', () => {
    service.getInventory({}).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/inventory'));
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [], message: 'OK', meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  });

  it('stockIn should POST to inventory/stock-in', () => {
    service.stockIn({ product_id: 'p1', warehouse_id: 'w1', quantity: 10 }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/inventory/stock-in'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.quantity).toBe(10);
    req.flush({ success: true, data: null, message: 'Stock added' });
  });

  it('stockOut should POST to inventory/stock-out', () => {
    service.stockOut({ product_id: 'p1', warehouse_id: 'w1', quantity: 5 }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/inventory/stock-out'));
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: null, message: 'Stock removed' });
  });
});
