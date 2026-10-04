import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ApiService } from '../../../core/services/api.service';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { PaymentDialogComponent } from '../../../shared/components/payment-dialog/payment-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { selectUserPermissionFor } from '../../../store/permissions/permissions.selectors';
import { Sale } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatTooltipModule, MatDialogModule,
    SearchInputComponent, PaginatorComponent, EmptyStateComponent,
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Sales Orders</h1><p class="page-subtitle">Manage sales orders and invoices</p></div>
        <a *ngIf="(salesPerms$ | async)?.create" mat-stroked-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon> New Sale
        </a>
      </div>
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar" *ngIf="items.length || search">
            <app-search-input placeholder="Search invoice..." (searchChange)="onSearch($event)"></app-search-input>
          </div>
          <div class="table-wrapper" *ngIf="items.length; else emptySales">
            <table mat-table [dataSource]="items" class="data-table">
              <ng-container matColumnDef="number">
                <th mat-header-cell *matHeaderCellDef>Invoice No</th>
                <td mat-cell *matCellDef="let r"><span class="code-badge">{{ r.sale_number }}</span></td>
              </ng-container>
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let r">{{ r.customer?.name || 'Walk-in' }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let r">{{ r.sale_date | date:'mediumDate' }}</td>
              </ng-container>
                 <ng-container matColumnDef="paid">
                <th mat-header-cell *matHeaderCellDef>Paid</th>
                <td mat-cell *matCellDef="let r">{{ r.paid_amount | currency:'INR' }}</td>
              </ng-container>
              <ng-container matColumnDef="balance">
                <th mat-header-cell *matHeaderCellDef>Balance</th>
                <td mat-cell *matCellDef="let r">{{ getBalance(r) | currency:'INR' }}</td>
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
                  <span class="badge" [class]="'badge--' + getPaymentColor(r.payment_status)">{{ r.payment_status }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <div class="action-buttons">
                    <a mat-icon-button [routerLink]="r.id" matTooltip="View"><mat-icon>visibility</mat-icon></a>
                    <button
                      *ngIf="(salesPerms$ | async)?.edit && r.status !== 'delivered' && r.status !== 'cancelled'"
                      mat-icon-button
                      color="accent"
                      (click)="markDelivered(r)"
                      matTooltip="Mark Delivered"
                    >
                      <mat-icon>local_shipping</mat-icon>
                    </button>
                    <button mat-icon-button (click)="downloadPDF(r.id)" matTooltip="Download PDF">
                      <mat-icon>picture_as_pdf</mat-icon>
                    </button>
                    <button
                      *ngIf="(salesPerms$ | async)?.edit && r.payment_status !== 'paid'"
                      mat-icon-button
                      (click)="openPayment(r)"
                      matTooltip="Record Payment"
                      color="primary"
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
          <ng-template #emptySales>
            <app-empty-state title="No Records Found" message="No sales orders are available right now."></app-empty-state>
          </ng-template>
          <app-paginator *ngIf="items.length" [total]="total" [pageSize]="limit" [pageIndex]="page" (pageChange)="onPage($event)"></app-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class SalesListComponent implements OnInit {
  cols = ['number', 'customer', 'date', 'paid', 'balance', 'total', 'status', 'payment', 'actions'];
  items: Sale[] = [];
  total = 0;
  page = 1;
  limit = 10;
  search = '';

  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private store = inject(Store);

  salesPerms$ = this.store.select(selectUserPermissionFor('sales'));

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<Sale[]>('sales', { page: this.page, limit: this.limit, search: this.search })
      .subscribe(r => { this.items = r.data; this.total = r.meta?.total || 0; });
  }
getBalance(data: Sale): number {
    return parseFloat(String(data.total_amount)) - parseFloat(String(data.paid_amount || 0));
  }
  onSearch(s: string): void { this.search = s; this.page = 1; this.load(); }
  onPage(e: { page: number; limit: number }): void { this.page = e.page; this.limit = e.limit; this.load(); }

  getStatusColor(s: string): string {
    return ({ pending: 'warning', confirmed: 'info', delivered: 'success', cancelled: 'danger' } as Record<string, string>)[s] || 'neutral';
  }

  getPaymentColor(s: string): string {
    return ({ unpaid: 'danger', partial: 'warning', paid: 'success' } as Record<string, string>)[s] || 'neutral';
  }

  downloadPDF(id: string): void {
    this.api.getBlob(`sales/${id}/pdf`).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `invoice-${id}.pdf`; a.click();
      URL.revokeObjectURL(url);
    });
  }

  openPayment(sale: Sale): void {
    const ref = this.dialog.open(PaymentDialogComponent, {
      width: '480px',
      data: {
        saleId: sale.id,
        saleNumber: sale.sale_number,
        totalAmount: sale.total_amount,
        paidAmount: sale.paid_amount || 0,
      },
    });
    ref.afterClosed().subscribe(updated => {
      if (updated) {
        const idx = this.items.findIndex(s => s.id === updated.id);
        if (idx >= 0) this.items = this.items.map((s, i) => i === idx ? { ...s, ...updated } : s);
      }
    });
  }

  markDelivered(sale: Sale): void {
    this.api.patch<Sale>(`sales/${sale.id}/status`, { status: 'delivered' }).subscribe({
      next: r => {
        this.items = this.items.map(s => s.id === sale.id ? { ...s, status: r.data.status } : s);
      },
      error: () => {
        // Optionally handle errors here
      },
    });
  }
}
