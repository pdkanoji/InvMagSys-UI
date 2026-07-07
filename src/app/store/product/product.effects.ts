import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as ProductActions from './product.actions';
import { ProductService } from '../../core/services/product.service';

@Injectable()
export class ProductEffects {
  private actions$ = inject(Actions);
  private productService = inject(ProductService);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(({ params }) =>
        this.productService.getAll(params).pipe(
          map(res => ProductActions.loadProductsSuccess({
            products: res.data,
            total: res.meta?.total || 0,
            page: res.meta?.page || 1,
            limit: res.meta?.limit || 20,
          })),
          catchError(err => of(ProductActions.loadProductsFailure({ error: err.error?.message || 'Load failed' }))),
        ),
      ),
    ),
  );

  loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProduct),
      switchMap(({ id }) =>
        this.productService.getById(id).pipe(
          map(res => ProductActions.loadProductSuccess({ product: res.data })),
          catchError(err => of(ProductActions.loadProductFailure({ error: err.error?.message || 'Load failed' }))),
        ),
      ),
    ),
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.createProduct),
      switchMap(({ formData }) =>
        this.productService.create(formData).pipe(
          map(res => ProductActions.createProductSuccess({ product: res.data })),
          catchError(err => of(ProductActions.createProductFailure({ error: err.error?.message || 'Create failed' }))),
        ),
      ),
    ),
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.updateProduct),
      switchMap(({ id, formData }) =>
        this.productService.update(id, formData).pipe(
          map(res => ProductActions.updateProductSuccess({ product: res.data })),
          catchError(err => of(ProductActions.updateProductFailure({ error: err.error?.message || 'Update failed' }))),
        ),
      ),
    ),
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.deleteProduct),
      switchMap(({ id }) =>
        this.productService.delete(id).pipe(
          map(() => ProductActions.deleteProductSuccess({ id })),
          catchError(err => of(ProductActions.deleteProductFailure({ error: err.error?.message || 'Delete failed' }))),
        ),
      ),
    ),
  );
}
