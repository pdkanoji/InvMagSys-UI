import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { DashboardData } from '../../core/models/inventory.model';
import { ChartConfiguration, ChartData } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule,
    BaseChartDirective, StatCardComponent,
  ],
  template: `
    <div class="page-wrapper">

      <!-- Header -->
      <div class="page-header">
        <div>
          <nav class="breadcrumb">
            <a href="#">Home</a>
            <mat-icon class="breadcrumb__sep" style="font-size:14px;width:14px;height:14px;">chevron_right</mat-icon>
            <span class="breadcrumb__current">Dashboard</span>
          </nav>
          <h1 class="page-title">Dashboard</h1>
        </div>
        <div class="dashboard-date">
          <mat-icon>calendar_today</mat-icon>
          <span>{{ dateRangeLabel }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-center" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading && data">

        <!-- Stats Row 1: counts -->
        <div class="stats-grid">
          <app-stat-card
            label="Total Products"
            [value]="data.totalProducts"
            icon="inventory_2"
            color="primary"
            [trend]="12.5">
          </app-stat-card>
          <app-stat-card
            label="Total Stock Value"
            [value]="(data.totalPurchaseAmount | currency:'USD':'symbol':'1.0-0') ?? ''"
            icon="account_balance_wallet"
            color="info"
            [trend]="6.9">
          </app-stat-card>
          <app-stat-card
            label="Low Stock Items"
            [value]="data.lowStockItems"
            icon="warning_amber"
            color="warning"
            [trend]="-3.2">
          </app-stat-card>
          <app-stat-card
            label="Out of Stock"
            [value]="data.outOfStockItems"
            icon="remove_shopping_cart"
            color="danger"
            [trend]="-2.1">
          </app-stat-card>
        </div>

        <!-- Stats Row 2: financials -->
        <div class="stats-grid" style="margin-top:-8px;">
          <app-stat-card
            label="Total Sales"
            [value]="(data.totalSalesAmount | currency:'USD':'symbol':'1.0-0') ?? ''"
            icon="point_of_sale"
            color="success"
            [trend]="15.9">
          </app-stat-card>
          <app-stat-card
            label="Total Purchases"
            [value]="(data.totalPurchaseAmount | currency:'USD':'symbol':'1.0-0') ?? ''"
            icon="shopping_bag"
            color="info"
            [trend]="16.7">
          </app-stat-card>
          <app-stat-card
            label="Total Profit"
            [value]="(data.totalProfit | currency:'USD':'symbol':'1.0-0') ?? ''"
            icon="trending_up"
            [color]="data.totalProfit >= 0 ? 'success' : 'danger'"
            [trend]="32.4">
          </app-stat-card>
          <app-stat-card
            label="Total Categories"
            [value]="data.totalCategories"
            icon="category"
            color="primary"
            [trend]="5.6">
          </app-stat-card>
        </div>

        <!-- Charts row -->
        <div class="charts-grid">

          <!-- Purchase vs Sales line chart -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Purchase vs Sales</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="lineChartData"
                [options]="lineChartOptions"
                type="line"
                class="chart-canvas">
              </canvas>
            </mat-card-content>
          </mat-card>

          <!-- Stock Status donut chart -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Stock Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="donutChartData"
                [options]="donutChartOptions"
                type="doughnut"
                class="chart-canvas">
              </canvas>
            </mat-card-content>
          </mat-card>

          <!-- Top Selling Products bar chart -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Top Selling Products</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="barChartData"
                [options]="barChartOptions"
                type="bar"
                class="chart-canvas">
              </canvas>
            </mat-card-content>
          </mat-card>

        </div>

        <!-- Recent Activities -->
        <mat-card class="table-card">
          <mat-card-header>
            <mat-card-title>Recent Activities</mat-card-title>
            <span class="spacer"></span>
            <a class="view-all-link" routerLink="/inventory/transactions">View All</a>
          </mat-card-header>
          <mat-card-content>
            <table class="recent-table" *ngIf="data.recentTransactions.length; else noData">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Details</th>
                  <th>Amount</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of data.recentTransactions">
                  <td>{{ t.created_at | date:'dd MMM yyyy, HH:mm' }}</td>
                  <td>
                    <span class="badge badge--{{ getTypeColor(t.transaction_type) }}">
                      {{ t.transaction_type | titlecase }}
                    </span>
                  </td>
                  <td><span class="code-badge">TXN</span></td>
                  <td>{{ t.product?.name || '-' }}</td>
                  <td class="fw-600">{{ t.quantity }}</td>
                  <td class="text-muted">-</td>
                </tr>
              </tbody>
            </table>
            <ng-template #noData>
              <p class="no-data">No recent transactions</p>
            </ng-template>
          </mat-card-content>
        </mat-card>

      </ng-container>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  loading = true;
  data: DashboardData | null = null;
  dateRangeLabel = '';
  private dashboardService = inject(DashboardService);

  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
    },
    elements: { line: { tension: 0.4 }, point: { radius: 3 } },
  };

  donutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '68%',
    plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } } },
  };

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y' as const,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  ngOnInit(): void {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    this.dateRangeLabel = `${this.fmt(start)} - ${this.fmt(now)}`;

    this.dashboardService.getDashboard().subscribe({
      next: res => {
        this.data = res.data;
        this.setupCharts(res.data);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private fmt(d: Date): string {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  setupCharts(data: DashboardData): void {
    this.lineChartData = {
      labels: data.monthlyChart.map(m => m.month),
      datasets: [
        {
          label: 'Purchases',
          data: data.monthlyChart.map(m => m.purchases),
          borderColor: '#3d72cf',
          backgroundColor: 'rgba(61,114,207,0.08)',
          fill: true,
        },
        {
          label: 'Sales',
          data: data.monthlyChart.map(m => m.sales),
          borderColor: '#2e9c52',
          backgroundColor: 'rgba(46,156,82,0.08)',
          fill: true,
        },
      ],
    };

    const inStock = data.availableStock;
    const lowStock = data.lowStockItems;
    const outOfStock = data.outOfStockItems;

    this.donutChartData = {
      labels: ['In Stock', 'Low Stock', 'Out of Stock'],
      datasets: [{
        data: [inStock, lowStock, outOfStock],
        backgroundColor: ['#2e9c52', '#f57c00', '#e53935'],
        borderWidth: 0,
      }],
    };

    this.barChartData = {
      labels: data.topSellingProducts.slice(0, 6).map(p => p.name.length > 14 ? p.name.substring(0, 14) + '…' : p.name),
      datasets: [{
        data: data.topSellingProducts.slice(0, 6).map(p => p.total_quantity),
        backgroundColor: '#3d72cf',
        borderRadius: 4,
        barThickness: 14,
      }],
    };
  }

  getTypeColor(type: string): string {
    const map: Record<string, string> = {
      purchase: 'success', sale: 'primary',
      stock_in: 'info', stock_out: 'warning', adjustment: 'neutral',
    };
    return map[type] || 'neutral';
  }
}
