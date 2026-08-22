import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { loadProducts, deleteProduct } from '../../../store/product/product.actions';
import { selectProducts, selectProductTotal, selectProductLoading } from '../../../store/product/product.selectors';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, MatTooltipModule, SearchInputComponent, PaginatorComponent, EmptyStateComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle">Manage your product catalog</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="onExport()"><mat-icon>download</mat-icon> Export</button>
          <a mat-stroked-button routerLink="import"><mat-icon>upload</mat-icon> Import</a>
          <a mat-flat-button color="primary" routerLink="new"><mat-icon>add</mat-icon> Add Product</a>
        </div>
      </div>

      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar" *ngIf="(products$ | async)?.length || search">
            <app-search-input placeholder="Search products..." (searchChange)="onSearch($event)"></app-search-input>
          </div>

          <div class="table-wrapper" *ngIf="(products$ | async)?.length; else emptyProducts">
            <table mat-table [dataSource]="(products$ | async) ?? []" class="data-table">
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef>Code</th>
                <td mat-cell *matCellDef="let p"><span class="code-badge">{{ p.code }}</span></td>
              </ng-container>
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let p">
                  <div class="product-cell">
                    <img *ngIf="p.image_url" [src]="p.image_url" class="product-thumb" alt="" />
                    <div>
                      <div class="product-name">{{ p.name }}</div>
                      <div class="product-brand">{{ p.brand }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let p">{{ p.category?.name || '-' }}</td>
              </ng-container>
              <ng-container matColumnDef="purchase_price">
                <th mat-header-cell *matHeaderCellDef>Purchase Price</th>
                <td mat-cell *matCellDef="let p">{{ p.purchase_price | currency:'INR' }}</td>
              </ng-container>
              <ng-container matColumnDef="selling_price">
                <th mat-header-cell *matHeaderCellDef>Selling Price</th>
                <td mat-cell *matCellDef="let p">{{ p.selling_price | currency:'INR' }}</td>
              </ng-container>
              <ng-container matColumnDef="tax_percentage">
                <th mat-header-cell *matHeaderCellDef>Tax %</th>
                <td mat-cell *matCellDef="let p">{{ p.tax_percentage }}%</td>
              </ng-container>
              <ng-container matColumnDef="reorder_level">
                <th mat-header-cell *matHeaderCellDef>Reorder Level</th>
                <td mat-cell *matCellDef="let p">{{ p.reorder_level }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p">
                  <span class="badge" [class]="p.is_active ? 'badge--success' : 'badge--neutral'">
                    {{ p.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let p">
                  <div class="action-buttons">
                    <a mat-icon-button [routerLink]="[p.id, 'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></a>
                    <button mat-icon-button color="warn" (click)="onDelete(p)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
            </table>
          </div>

          <ng-template #emptyProducts>
            <app-empty-state title="No Records Found" message="Try adjusting your search or add a new product to get started."></app-empty-state>
          </ng-template>

          <app-paginator *ngIf="(products$ | async)?.length" [total]="(total$ | async) ?? 0" [pageSize]="limit" [pageIndex]="page"
            (pageChange)="onPageChange($event)"></app-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ProductsListComponent implements OnInit {
  displayedColumns = ['code', 'name', 'category', 'purchase_price', 'selling_price', 'tax_percentage', 'reorder_level', 'status', 'actions'];
  page = 1; limit = 10; search = '';
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private productService = inject(ProductService);

  products$ = this.store.select(selectProducts);
  total$ = this.store.select(selectProductTotal);
  loading$ = this.store.select(selectProductLoading);

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.store.dispatch(loadProducts({ params: { page: this.page, limit: this.limit, search: this.search } }));
  }

  onSearch(search: string): void { this.search = search; this.page = 1; this.loadProducts(); }
  onPageChange(event: { page: number; limit: number }): void { this.page = event.page; this.limit = event.limit; this.loadProducts(); }

  onDelete(product: { id: string; name: string }): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Product', message: `Delete "${product.name}"? This action cannot be undone.` },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(deleteProduct({ id: product.id }));
        this.snackBar.open('Product deleted', 'Close', { duration: 3000 });
      }
    });
  }

  onExport(): void {
    this.productService.export().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'products.xlsx'; a.click();
      URL.revokeObjectURL(url);
    });
  }

}
