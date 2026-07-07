import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InventoryService } from '../../../core/services/inventory.service';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatSelectModule, MatFormFieldModule, PaginatorComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Inventory Transactions</h1></div>
        <a mat-stroked-button routerLink="/inventory"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar">
            <mat-form-field appearance="outline" class="filter-field"><mat-label>Type</mat-label><mat-select [(value)]="typeFilter" (selectionChange)="load()"><mat-option value="">All</mat-option><mat-option value="stock_in">Stock In</mat-option><mat-option value="stock_out">Stock Out</mat-option><mat-option value="purchase">Purchase</mat-option><mat-option value="sale">Sale</mat-option><mat-option value="adjustment">Adjustment</mat-option><mat-option value="transfer_in">Transfer In</mat-option><mat-option value="transfer_out">Transfer Out</mat-option></mat-select></mat-form-field>
          </div>
          <div class="table-wrapper">
            <table mat-table [dataSource]="items" class="data-table">
              <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let r">{{ r['product']?.name }}</td></ng-container>
              <ng-container matColumnDef="warehouse"><th mat-header-cell *matHeaderCellDef>Warehouse</th><td mat-cell *matCellDef="let r">{{ r['warehouse']?.name }}</td></ng-container>
              <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>Type</th><td mat-cell *matCellDef="let r"><span class="badge" [class]="'badge--' + getTypeColor(r['transaction_type'])">{{ r['transaction_type'] }}</span></td></ng-container>
              <ng-container matColumnDef="quantity"><th mat-header-cell *matHeaderCellDef>Quantity</th><td mat-cell *matCellDef="let r"><span [class.text-success]="r['quantity'] > 0" [class.text-danger]="r['quantity'] < 0">{{ r['quantity'] > 0 ? '+' : '' }}{{ r['quantity'] }}</span></td></ng-container>
              <ng-container matColumnDef="notes"><th mat-header-cell *matHeaderCellDef>Notes</th><td mat-cell *matCellDef="let r">{{ r['notes'] || '-' }}</td></ng-container>
              <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r['created_at'] | date:'short' }}</td></ng-container>
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
export class TransactionsComponent implements OnInit {
  cols = ['product','warehouse','type','quantity','notes','date'];
  items: unknown[] = []; total = 0; page = 1; limit = 20; typeFilter = '';
  private inventoryService = inject(InventoryService);
  ngOnInit(): void { this.load(); }
  load(): void {
    this.inventoryService.getTransactions({ page: this.page, limit: this.limit, transaction_type: this.typeFilter })
      .subscribe(r => { this.items = r.data; this.total = r.meta?.total || 0; });
  }
  onPage(e: { page: number; limit: number }): void { this.page = e.page; this.limit = e.limit; this.load(); }
  getTypeColor(type: string): string {
    return { stock_in: 'success', purchase: 'success', transfer_in: 'info', stock_out: 'warning', sale: 'warning', transfer_out: 'warning', adjustment: 'neutral', damage: 'danger' }[type] || 'neutral';
  }
}
