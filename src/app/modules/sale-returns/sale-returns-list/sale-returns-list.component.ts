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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { ApiService } from '../../../core/services/api.service';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { selectUserPermissionFor } from '../../../store/permissions/permissions.selectors';
import { SaleReturn } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-sale-returns-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatTooltipModule, MatSelectModule, MatFormFieldModule,
    SearchInputComponent, PaginatorComponent, EmptyStateComponent,
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Sale Returns</h1><p class="page-subtitle">Manage customer return requests</p></div>
        <a *ngIf="(perms$ | async)?.create" mat-stroked-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon> New Return
        </a>
      </div>
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar" *ngIf="items.length || search || statusFilter">
            <app-search-input placeholder="Search return number..." (searchChange)="onSearch($event)"></app-search-input>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [(value)]="statusFilter" (selectionChange)="load()">
                <mat-option value="">All</mat-option>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="approved">Approved</mat-option>
                <mat-option value="completed">Completed</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="table-wrapper" *ngIf="items.length; else emptySaleReturns">
            <table mat-table [dataSource]="items" class="data-table">
              <ng-container matColumnDef="number">
                <th mat-header-cell *matHeaderCellDef>Return No</th>
                <td mat-cell *matCellDef="let r"><span class="code-badge">{{ r.return_number }}</span></td>
              </ng-container>
              <ng-container matColumnDef="sale">
                <th mat-header-cell *matHeaderCellDef>Invoice No</th>
                <td mat-cell *matCellDef="let r">{{ r.sale?.sale_number || '-' }}</td>
              </ng-container>
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let r">{{ r.customer?.name || 'Walk-in' }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let r">{{ r.return_date | date:'mediumDate' }}</td>
              </ng-container>
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let r">{{ r.total_amount | currency:'INR' }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="badge" [class]="'badge--' + getStatusColor(r.status)">{{ r.status }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <div class="action-buttons">
                    <a mat-icon-button [routerLink]="r.id" matTooltip="View"><mat-icon>visibility</mat-icon></a>
                    <button
                      *ngIf="(perms$ | async)?.edit && r.status === 'pending'"
                      mat-icon-button color="primary"
                      (click)="updateStatus(r.id, 'approved')"
                      matTooltip="Approve"
                    ><mat-icon>thumb_up</mat-icon></button>
                    <button
                      *ngIf="(perms$ | async)?.edit && r.status === 'approved'"
                      mat-icon-button color="primary"
                      (click)="updateStatus(r.id, 'completed')"
                      matTooltip="Complete"
                    ><mat-icon>check_circle</mat-icon></button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;" class="table-row"></tr>
            </table>
          </div>
          <ng-template #emptySaleReturns>
            <app-empty-state title="No Records Found" message="No sale returns are available for the current filters."></app-empty-state>
          </ng-template>
          <app-paginator *ngIf="items.length" [total]="total" [pageSize]="limit" [pageIndex]="page" (pageChange)="onPage($event)"></app-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class SaleReturnsListComponent implements OnInit {
  cols = ['number', 'sale', 'customer', 'date', 'total', 'status', 'actions'];
  items: SaleReturn[] = [];
  total = 0; page = 1; limit = 10; search = ''; statusFilter = '';

  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private store = inject(Store);
  perms$ = this.store.select(selectUserPermissionFor('sales'));

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<SaleReturn[]>('sale-returns', { page: this.page, limit: this.limit, search: this.search, status: this.statusFilter })
      .subscribe(r => { this.items = r.data; this.total = r.meta?.total || 0; });
  }

  onSearch(s: string): void { this.search = s; this.page = 1; this.load(); }
  onPage(e: { page: number; limit: number }): void { this.page = e.page; this.limit = e.limit; this.load(); }

  getStatusColor(s: string): string {
    return ({ pending: 'warning', approved: 'info', completed: 'success', cancelled: 'danger' } as Record<string, string>)[s] || 'neutral';
  }

  updateStatus(id: string, status: string): void {
    this.api.patch(`sale-returns/${id}/status`, { status }).subscribe({
      next: () => { this.snackBar.open(`Return ${status}`, 'Close', { duration: 2000 }); this.load(); },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 2000 }),
    });
  }
}
