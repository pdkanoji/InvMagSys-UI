import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ProductState } from './product.reducer';

export const selectProductState = createFeatureSelector<ProductState>('products');
export const selectProducts = createSelector(selectProductState, s => s.products);
export const selectSelectedProduct = createSelector(selectProductState, s => s.selectedProduct);
export const selectProductTotal = createSelector(selectProductState, s => s.total);
export const selectProductPage = createSelector(selectProductState, s => s.page);
export const selectProductLimit = createSelector(selectProductState, s => s.limit);
export const selectProductLoading = createSelector(selectProductState, s => s.isLoading);
export const selectProductError = createSelector(selectProductState, s => s.error);
