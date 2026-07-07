import { createReducer, on } from '@ngrx/store';
import { Product } from '../../core/models/inventory.model';
import * as ProductActions from './product.actions';

export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  error: null,
};

export const productReducer = createReducer(
  initialState,
  on(ProductActions.loadProducts, state => ({ ...state, isLoading: true, error: null })),
  on(ProductActions.loadProductsSuccess, (state, { products, total, page, limit }) => ({
    ...state, products, total, page, limit, isLoading: false,
  })),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

  on(ProductActions.loadProduct, state => ({ ...state, isLoading: true, selectedProduct: null })),
  on(ProductActions.loadProductSuccess, (state, { product }) => ({ ...state, selectedProduct: product, isLoading: false })),
  on(ProductActions.loadProductFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

  on(ProductActions.createProductSuccess, (state, { product }) => ({
    ...state, products: [product, ...state.products], total: state.total + 1,
  })),
  on(ProductActions.updateProductSuccess, (state, { product }) => ({
    ...state,
    products: state.products.map(p => p.id === product.id ? product : p),
    selectedProduct: product,
  })),
  on(ProductActions.deleteProductSuccess, (state, { id }) => ({
    ...state,
    products: state.products.filter(p => p.id !== id),
    total: state.total - 1,
  })),
  on(ProductActions.createProductFailure, ProductActions.updateProductFailure, ProductActions.deleteProductFailure, (state, { error }) => ({
    ...state, error,
  })),
  on(ProductActions.clearProductError, state => ({ ...state, error: null })),
);
