import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/services/api.service';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { AuditLog } from '../../core/models/inventory.model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, PaginatorComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Audit Logs</h1><p class="page-subtitle">Track all system activities</p></div>
      </div>
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar">
            <mat-form-field appearance="outline" class="filter-field"><mat-label>Module</mat-label><mat-select [(value)]="moduleFilter" (selectionChange)="load()"><mat-option value="">All</mat-option><mat-option value="auth">Auth</mat-option><mat-option value="products">Products</mat-option><mat-option value="inventory">Inventory</mat-option><mat-option value="purchases">Purchases</mat-option><mat-option value="sales">Sales</mat-option></mat-select></mat-form-field>
            <mat-form-field appearance="outline" class="filter-field"><mat-label>Action</mat-label><mat-select [(value)]="actionFilter" (selectionChange)="load()"><mat-option value="">All</mat-option><mat-option value="login">Login</mat-option><mat-option value="logout">Logout</mat-option><mat-option value="create">Create</mat-option><mat-option value="update">Update</mat-option><mat-option value="delete">Delete</mat-option></mat-select></mat-form-field>
          </div>
          <div class="table-wrapper">
            <table mat-table [dataSource]="items" class="data-table">
              <ng-container matColumnDef="user"><th mat-header-cell *matHeaderCellDef>User</th><td mat-cell *matCellDef="let r">{{ r.user?.first_name }} {{ r.user?.last_name }}</td></ng-container>
              <ng-container matColumnDef="action"><th mat-header-cell *matHeaderCellDef>Action</th><td mat-cell *matCellDef="let r"><span class="badge" [class]="'badge--' + getActionColor(r.action)">{{ r.action }}</span></td></ng-container>
              <ng-container matColumnDef="module"><th mat-header-cell *matHeaderCellDef>Module</th><td mat-cell *matCellDef="let r">{{ r.module }}</td></ng-container>
              <ng-container matColumnDef="ip"><th mat-header-cell *matHeaderCellDef>IP</th><td mat-cell *matCellDef="let r">{{ r.ip_address || '-' }}</td></ng-container>
              <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.created_at | date:'short' }}</td></ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;" class="table-row"></tr>
            </table>
          </div>
          <app-paginator [total]="total" [pageSize]="limit" [pageIndex]="page" (pageChange)="onPage($event)"></app-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class AuditLogsComponent implements OnInit {
  cols = ['user','action','module','ip','date'];
  items: AuditLog[] = []; total = 0; page = 1; limit = 10; moduleFilter = ''; actionFilter = '';
  private api = inject(ApiService);
  ngOnInit(): void { this.load(); }
  load(): void { this.api.get<AuditLog[]>('audit-logs', { page: this.page, limit: this.limit, module: this.moduleFilter, action: this.actionFilter }).subscribe(r => { this.items = r.data; this.total = r.meta?.total || 0; }); }
  onPage(e: { page: number; limit: number }): void { this.page = e.page; this.limit = e.limit; this.load(); }
  getActionColor(action: string): string { return { login: 'success', logout: 'neutral', create: 'info', update: 'warning', delete: 'danger' }[action] || 'neutral'; }
}
