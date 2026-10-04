import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Inventory } from '../../../core/models/inventory.model';
import { ClearZeroOnFocusDirective } from '../../../shared/directives/clear-zero-on-focus.directive';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatTooltipModule, SearchInputComponent, PaginatorComponent,
    MatFormFieldModule, MatSelectModule, MatInputModule, ReactiveFormsModule, EmptyStateComponent, ClearZeroOnFocusDirective,
  ],
  template: `
    <div class="page-wrapper inventory-page">
      <div class="page-header">
        <div>
          <nav class="breadcrumb">
            <a href="#">Home</a>
            <mat-icon class="breadcrumb__sep icon-muted">chevron_right</mat-icon>
            <span class="breadcrumb__current">Stock List</span>
          </nav>
          <h1 class="page-title">Stock List</h1>
        </div>
        <div class="header-actions">
          <a mat-stroked-button routerLink="transactions">
            <mat-icon>history</mat-icon> Transactions
          </a>
          <button mat-stroked-button color="primary" (click)="openStockIn()">
            <mat-icon>add</mat-icon> Stock In
          </button>
          <button mat-stroked-button color="warn" (click)="openStockOut()">
            <mat-icon>remove</mat-icon> Stock Out
          </button>
          <button mat-stroked-button (click)="openAdjustment()">
            <mat-icon>tune</mat-icon> Adjust
          </button>
        </div>
      </div>

      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar inventory-filter-toolbar" *ngIf="items.length || search || warehouseFilter">
            <app-search-input placeholder="Search products..." (searchChange)="onSearch($event)"></app-search-input>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>All Categories</mat-label>
              <mat-select value="">
                <mat-option value="">All Categories</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Warehouse</mat-label>
              <mat-select [(value)]="warehouseFilter" (selectionChange)="onFilterChange()">
                <mat-option value="">All Warehouses</mat-option>
                <mat-option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [(value)]="statusFilter" (selectionChange)="onFilterChange()">
                <mat-option value="">All Status</mat-option>
                <mat-option value="in_stock">In Stock</mat-option>
                <mat-option value="low_stock">Low Stock</mat-option>
                <mat-option value="out_of_stock">Out of Stock</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="table-wrapper" *ngIf="items.length || !loading; else emptyInventory">
            <table mat-table [dataSource]="items" class="data-table" *ngIf="items.length; else emptyInventory">

              <ng-container matColumnDef="product">
                <th mat-header-cell *matHeaderCellDef>Product Name</th>
                <td mat-cell *matCellDef="let r">
                  <div class="product-cell">
                    <div class="product-thumb-placeholder">
                      <mat-icon class="icon-muted">inventory_2</mat-icon>
                    </div>
                    <div>
                      <div class="product-name">{{ r.product?.name }}</div>
                      <div class="product-brand">{{ r.product?.code }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef>Code</th>
                <td mat-cell *matCellDef="let r">
                  <span class="code-badge">{{ r.product?.code || '-' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="warehouse">
                <th mat-header-cell *matHeaderCellDef>Warehouse</th>
                <td mat-cell *matCellDef="let r">{{ r.warehouse?.name }}</td>
              </ng-container>

              <ng-container matColumnDef="current_stock">
                <th mat-header-cell *matHeaderCellDef>Total Qty</th>
                <td mat-cell *matCellDef="let r">{{ r.current_stock }}</td>
              </ng-container>

              <ng-container matColumnDef="available">
                <th mat-header-cell *matHeaderCellDef>Available</th>
                <td mat-cell *matCellDef="let r">
                  <span class="stock-value"
                    [class.stock-critical]="r.available_stock <= 0"
                    [class.stock-low]="r.available_stock > 0 && r.available_stock <= (r.product?.reorder_level || 0)">
                    {{ r.available_stock }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="reserved">
                <th mat-header-cell *matHeaderCellDef>Reserved</th>
                <td mat-cell *matCellDef="let r">{{ r.reserved_stock }}</td>
              </ng-container>

              <ng-container matColumnDef="damaged">
                <th mat-header-cell *matHeaderCellDef>Damaged</th>
                <td mat-cell *matCellDef="let r">{{ r.damaged_stock }}</td>
              </ng-container>

              <ng-container matColumnDef="reorder">
                <th mat-header-cell *matHeaderCellDef>Reorder</th>
                <td mat-cell *matCellDef="let r">{{ r.product?.reorder_level }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="badge"
                    [class]="r.available_stock <= 0 ? 'badge--danger' : r.available_stock <= (r.product?.reorder_level || 0) ? 'badge--warning' : 'badge--success'">
                    {{ r.available_stock <= 0 ? 'Out of Stock' : r.available_stock <= (r.product?.reorder_level || 0) ? 'Low Stock' : 'In Stock' }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;" class="table-row"></tr>
            </table>

          </div>

          <ng-template #emptyInventory>
            <app-empty-state title="No Records Found" message="No inventory records are available for the current filter."></app-empty-state>
          </ng-template>

          <app-paginator *ngIf="items.length"
            [total]="total"
            [pageSize]="limit"
            [pageIndex]="page"
            (pageChange)="onPage($event)">
          </app-paginator>
        </mat-card-content>
      </mat-card>

      <!-- Stock Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <mat-card class="modal-card background-color" (click)="$event.stopPropagation()">
          <mat-card-header>
            <div class="stock-modal__header">
              <div>
                <h2 class="stock-modal__title">{{ modalTitle }}</h2>
                <p class="stock-modal__subtitle">Update inventory with stock-in, stock-out, or adjustment actions.</p>
              </div>
              <button mat-icon-button class="modal-close-btn" type="button" (click)="closeModal()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="stockForm" (ngSubmit)="submitStock()" class="stock-modal__form">
              <mat-form-field appearance="outline">
                <mat-label>Product *</mat-label>
                <mat-select formControlName="product_id">
                  <mat-option *ngFor="let p of products" [value]="p.id">{{ p.name }}</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Warehouse *</mat-label>
                <mat-select formControlName="warehouse_id">
                  <mat-option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ modalAction === 'adjustment' ? 'New Quantity' : 'Quantity' }} *</mat-label>
                <input matInput type="number" [formControlName]="modalAction === 'adjustment' ? 'new_quantity' : 'quantity'" min="1" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="form-col-full">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="2"></textarea>
              </mat-form-field>
              <div class="stock-modal__footer form-col-full">
                <button mat-stroked-button type="button" (click)="closeModal()">Cancel</button>
                <button mat-stroked-button color="primary" type="submit" [disabled]="stockForm.invalid">Confirm</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
})
export class InventoryListComponent implements OnInit {
  cols = ['product', 'code', 'warehouse', 'current_stock', 'available', 'reserved', 'damaged', 'reorder', 'status'];
  items: Inventory[] = [];
  total = 0; page = 1; limit = 10; search = ''; warehouseFilter = ''; statusFilter = ''; loading = false;
  warehouses: { id: string; name: string }[] = [];
  products: { id: string; name: string }[] = [];
  showModal = false; modalTitle = ''; modalAction: 'stock_in' | 'stock_out' | 'adjustment' = 'stock_in';

  private api = inject(ApiService);
  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  stockForm = this.fb.group({
    product_id: [null, Validators.required],
    warehouse_id: [null, Validators.required],
    quantity: [null],
    new_quantity: [null],
    notes: [''],
  });

  ngOnInit(): void {
    this.load();
    this.api.get<unknown[]>('warehouses', { limit: 100 }).subscribe(r => this.warehouses = r.data as { id: string; name: string }[]);
    this.api.get<unknown[]>('products', { limit: 1000, is_active: 'true' }).subscribe(r => this.products = r.data as { id: string; name: string }[]);
  }

  load(): void {
    this.loading = true;
    this.inventoryService.getInventory({
      page: this.page,
      limit: this.limit,
      search: this.search,
      warehouse_id: this.warehouseFilter,
      status: this.statusFilter,
    })
      .subscribe(r => { this.items = r.data as Inventory[]; this.total = r.meta?.total || 0; this.loading = false; });
  }

  onSearch(s: string): void { this.search = s; this.page = 1; this.load(); }
  onFilterChange(): void { this.page = 1; this.load(); }
  onPage(e: { page: number; limit: number }): void { this.page = e.page; this.limit = e.limit; this.load(); }

  openStockIn(): void    { this.modalTitle = 'Stock In';         this.modalAction = 'stock_in';    this.stockForm.reset(); this.showModal = true; }
  openStockOut(): void   { this.modalTitle = 'Stock Out';        this.modalAction = 'stock_out';   this.stockForm.reset(); this.showModal = true; }
  openAdjustment(): void { this.modalTitle = 'Stock Adjustment'; this.modalAction = 'adjustment';  this.stockForm.reset(); this.showModal = true; }
  closeModal(): void     { this.showModal = false; }

  submitStock(): void {
    const v = this.stockForm.value;
    const obs = this.modalAction === 'stock_in'
      ? this.inventoryService.stockIn({ product_id: v.product_id!, warehouse_id: v.warehouse_id!, quantity: v.quantity!, notes: v.notes || undefined })
      : this.modalAction === 'stock_out'
      ? this.inventoryService.stockOut({ product_id: v.product_id!, warehouse_id: v.warehouse_id!, quantity: v.quantity!, notes: v.notes || undefined })
      : this.inventoryService.adjustment({ product_id: v.product_id!, warehouse_id: v.warehouse_id!, new_quantity: v.new_quantity!, notes: v.notes || undefined });

    obs.subscribe({
      next: () => { this.snackBar.open('Stock updated', 'Close', { duration: 2000 }); this.closeModal(); this.load(); },
      error: err => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 2000 }),
    });
  }
}
