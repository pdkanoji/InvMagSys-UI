import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { ApiService } from '../../../core/services/api.service';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { PurchasePaymentDialogComponent } from '../../../shared/components/purchase-payment-dialog/purchase-payment-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { selectUserPermissionFor } from '../../../store/permissions/permissions.selectors';
import { Purchase } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatTooltipModule, MatSelectModule, MatFormFieldModule,
    MatDialogModule, SearchInputComponent, PaginatorComponent, EmptyStateComponent,
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Purchase Orders</h1><p class="page-subtitle">Manage purchase orders</p></div>
        <a *ngIf="(purchasePerms$ | async)?.create" mat-flat-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon> New Purchase
        </a>
      </div>
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar" *ngIf="items.length || search || statusFilter">
            <app-search-input placeholder="Search PO number..." (searchChange)="onSearch($event)"></app-search-input>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [(value)]="statusFilter" (selectionChange)="load()">
                <mat-option value="">All</mat-option>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="partial">Partial</mat-option>
                <mat-option value="received">Received</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="table-wrapper" *ngIf="items.length; else emptyPurchases">
            <table mat-table [dataSource]="items" class="data-table">
              <ng-container matColumnDef="number">
                <th mat-header-cell *matHeaderCellDef>PO Number</th>
                <td mat-cell *matCellDef="let r"><span class="code-badge">{{ r.purchase_number }}</span></td>
              </ng-container>
              <ng-container matColumnDef="supplier">
                <th mat-header-cell *matHeaderCellDef>Supplier</th>
                <td mat-cell *matCellDef="let r">{{ r.supplier?.name || '-' }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let r">{{ r.purchase_date | date:'mediumDate' }}</td>
              </ng-container>
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let r">{{ r.total_amount | currency:'INR' }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="badge" [class]="'badge--' + getStatusColor(r.status)">{{ r.status }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="payment">
                <th mat-header-cell *matHeaderCellDef>Payment</th>
                <td mat-cell *matCellDef="let r">
                  <span class="badge" [class]="'badge--' + getPaymentColor(r.payment_status || 'unpaid')">
                    {{ r.payment_status || 'unpaid' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <div class="action-buttons">
                    <a mat-icon-button [routerLink]="r.id" matTooltip="View"><mat-icon>visibility</mat-icon></a>
                    <button mat-icon-button (click)="downloadPDF(r.id)" matTooltip="Download PDF">
                      <mat-icon>picture_as_pdf</mat-icon>
                    </button>
                    <button
                      *ngIf="(purchasePerms$ | async)?.edit && r.status === 'pending'"
                      mat-icon-button color="primary"
                      (click)="markReceived(r.id)"
                      matTooltip="Mark as Received"
                    >
                      <mat-icon>check_circle</mat-icon>
                    </button>
                    <button
                      *ngIf="(purchasePerms$ | async)?.edit && r.payment_status !== 'paid'"
                      mat-icon-button color="accent"
                      (click)="openPayment(r)"
                      matTooltip="Record Payment"
                    >
                      <mat-icon>payments</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;" class="table-row"></tr>
            </table>
          </div>
          <ng-template #emptyPurchases>
            <app-empty-state title="No Records Found" message="No purchase orders are available for the current filters."></app-empty-state>
          </ng-template>
          <app-paginator *ngIf="items.length" [total]="total" [pageSize]="limit" [pageIndex]="page" (pageChange)="onPage($event)"></app-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class PurchasesListComponent implements OnInit {
  cols = ['number', 'supplier', 'date', 'total', 'status', 'payment', 'actions'];
  items: Purchase[] = [];
  total = 0; page = 1; limit = 20; search = ''; statusFilter = '';

  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private store = inject(Store);

  purchasePerms$ = this.store.select(selectUserPermissionFor('purchases'));

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<Purchase[]>('purchases', { page: this.page, limit: this.limit, search: this.search, status: this.statusFilter })
      .subscribe(r => { this.items = r.data; this.total = r.meta?.total || 0; });
  }

  onSearch(s: string): void { this.search = s; this.page = 1; this.load(); }
  onPage(e: { page: number; limit: number }): void { this.page = e.page; this.limit = e.limit; this.load(); }

  getStatusColor(status: string): string {
    return ({ pending: 'warning', partial: 'info', received: 'success', cancelled: 'danger' } as Record<string, string>)[status] || 'neutral';
  }

  getPaymentColor(s: string): string {
    return ({ unpaid: 'danger', partial: 'warning', paid: 'success' } as Record<string, string>)[s] || 'neutral';
  }

  markReceived(id: string): void {
    this.api.patch(`purchases/${id}/status`, { status: 'received' }).subscribe({
      next: () => { this.snackBar.open('Purchase marked as received', 'Close', { duration: 2000 }); this.load(); },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 2000 }),
    });
  }

  downloadPDF(id: string): void {
    this.api.getBlob(`purchases/${id}/pdf`).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `purchase-${id}.pdf`; a.click();
      URL.revokeObjectURL(url);
    });
  }

  openPayment(purchase: Purchase): void {
    const ref = this.dialog.open(PurchasePaymentDialogComponent, {
      width: '480px',
      data: {
        purchaseId: purchase.id,
        purchaseNumber: purchase.purchase_number,
        totalAmount: purchase.total_amount,
        paidAmount: purchase.paid_amount || 0,
      },
    });
    ref.afterClosed().subscribe(updated => {
      if (updated) {
        this.items = this.items.map(p => p.id === updated.id ? { ...p, ...updated } : p);
      }
    });
  }
}
