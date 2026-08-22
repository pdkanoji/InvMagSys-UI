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
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartConfiguration } from 'chart.js';
import { ApiService } from '../../../core/services/api.service';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Warehouse } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-warehouses-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatTooltipModule, PaginatorComponent, BaseChartDirective,
    MatSelectModule, MatFormFieldModule,
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <nav class="breadcrumb">
            <a href="#">Home</a>
            <mat-icon class="breadcrumb__sep icon-muted">chevron_right</mat-icon>
            <span class="breadcrumb__current">Warehouse Management</span>
          </nav>
          <h1 class="page-title">Warehouse Management</h1>
        </div>
        <a mat-flat-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon> Add Warehouse
        </a>
      </div>

      <!-- Warehouses Table -->
      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>Warehouses</mat-card-title>
          <span class="spacer"></span>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filter by Status</mat-label>
            <mat-select value="">
              <mat-option value="">All</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-header>
        <mat-card-content>
          <div class="table-wrapper">
            <table mat-table [dataSource]="items" class="data-table">

              <ng-container matColumnDef="no">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let r; let i = index">{{ (page - 1) * limit + i + 1 }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Warehouse Name</th>
                <td mat-cell *matCellDef="let r">
                  <div class="fw-600">{{ r.name }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="location">
                <th mat-header-cell *matHeaderCellDef>Location</th>
                <td mat-cell *matCellDef="let r">{{ r.city || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="contact_person">
                <th mat-header-cell *matHeaderCellDef>Manager</th>
                <td mat-cell *matCellDef="let r">{{ r.contact_person || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="capacity">
                <th mat-header-cell *matHeaderCellDef>Capacity</th>
                <td mat-cell *matCellDef="let r">{{ r.capacity || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="badge" [class]="r.is_active ? 'badge--success' : 'badge--neutral'">
                    {{ r.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let r">
                  <div class="action-buttons">
                    <a mat-icon-button [routerLink]="[r.id, 'edit']" matTooltip="Edit">
                      <mat-icon class="icon-primary">edit</mat-icon>
                    </a>
                    <button mat-icon-button (click)="onDelete(r)" matTooltip="Delete">
                      <mat-icon class="icon-danger">delete_outline</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;" class="table-row"></tr>
            </table>
          </div>
          <app-paginator
            [total]="total"
            [pageSize]="limit"
            [pageIndex]="page"
            (pageChange)="onPage($event)">
          </app-paginator>
        </mat-card-content>
      </mat-card>

      <!-- Warehouse Stock Overview -->
      <div class="page-header page-header--compact">
        <h2 class="section-title">Warehouse Stock Overview</h2>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Warehouse</mat-label>
          <mat-select value="main">
            <mat-option value="main">Main Warehouse</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="warehouse-overview">
        <div class="overview-card">
          <div class="overview-card__label">Total Products</div>
          <div class="overview-card__value">{{ overviewStats.totalProducts }}</div>
        </div>
        <div class="overview-card">
          <div class="overview-card__label">Total Stock</div>
          <div class="overview-card__value">{{ overviewStats.totalStock }}</div>
        </div>
        <div class="overview-card">
          <div class="overview-card__label">Stock Value</div>
          <div class="overview-card__value overview-value--primary">{{ overviewStats.stockValue | currency:'USD':'symbol':'1.0-0' }}</div>
        </div>
        <div class="overview-card">
          <div class="overview-card__label">Low Stock Items</div>
          <div class="overview-card__value overview-value--warning">{{ overviewStats.lowStock }}</div>
        </div>
      </div>

      <div class="charts-grid charts-grid--reduced">
        <!-- Stock by Category bar chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Stock by Category</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [data]="categoryBarData"
              [options]="categoryBarOptions"
              type="bar"
              class="chart-canvas">
            </canvas>
          </mat-card-content>
        </mat-card>

        <!-- Stock Status donut -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Stock Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [data]="stockStatusData"
              [options]="stockStatusOptions"
              type="doughnut"
              class="chart-canvas">
            </canvas>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
})
export class WarehousesListComponent implements OnInit {
  cols = ['no', 'name', 'location', 'contact_person', 'capacity', 'status', 'actions'];
  items: Warehouse[] = [];
  total = 0; page = 1; limit = 10;

  overviewStats = { totalProducts: 0, totalStock: 0, stockValue: 0, lowStock: 0 };

  categoryBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  categoryBarOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  stockStatusData: ChartData<'doughnut'> = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#2e9c52', '#f57c00', '#e53935'],
      borderWidth: 0,
    }],
  };

  stockStatusOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '65%',
    plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } } },
  };

  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<Warehouse[]>('warehouses', { page: this.page, limit: this.limit })
      .subscribe(r => {
        this.items = r.data;
        this.total = r.meta?.total || 0;
        this.buildCharts();
      });
  }

  buildCharts(): void {
    this.overviewStats = {
      totalProducts: this.total,
      totalStock: 8250,
      stockValue: 182450,
      lowStock: 3,
    };

    this.categoryBarData = {
      labels: ['Electronics', 'Furniture', 'Clothing', 'Food', 'Tools'],
      datasets: [{
        data: [3200, 1800, 1500, 1000, 750],
        backgroundColor: '#3d72cf',
        borderRadius: 4,
        barThickness: 14,
      }],
    };

    this.stockStatusData = {
      labels: ['In Stock (85%)', 'Low Stock (10%)', 'Out of Stock (5%)'],
      datasets: [{
        data: [85, 10, 5],
        backgroundColor: ['#2e9c52', '#f57c00', '#e53935'],
        borderWidth: 0,
      }],
    };
  }

  onPage(e: { page: number; limit: number }): void { this.page = e.page; this.limit = e.limit; this.load(); }

  onDelete(item: Warehouse): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Warehouse', message: `Delete "${item.name}"?` },
    }).afterClosed().subscribe(c => {
      if (c) {
        this.api.delete(`warehouses/${item.id}`).subscribe(() => {
          this.snackBar.open('Deleted', 'Close', { duration: 2000 });
          this.load();
        });
      }
    });
  }
}
