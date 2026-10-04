import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Reports</h1><p class="page-subtitle">Generate and export business reports</p></div>
      </div>

      <div class="reports-grid">
        <mat-card class="report-card" *ngFor="let report of reports">
          <mat-card-content>
            <div class="report-icon"><mat-icon>{{ report.icon }}</mat-icon></div>
            <h3 class="report-title">{{ report.title }}</h3>
            <p class="report-desc">{{ report.description }}</p>
            <div class="report-filters" [formGroup]="filterForm">
              <mat-form-field appearance="outline" class="filter-date" *ngIf="report.hasDateFilter">
                <mat-label>From Date</mat-label>
                <input matInput [matDatepicker]="pd1" formControlName="from_date" />
                <mat-datepicker-toggle matSuffix [for]="pd1"></mat-datepicker-toggle>
                <mat-datepicker #pd1></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline" class="filter-date" *ngIf="report.hasDateFilter">
                <mat-label>To Date</mat-label>
                <input matInput [matDatepicker]="pd2" formControlName="to_date" />
                <mat-datepicker-toggle matSuffix [for]="pd2"></mat-datepicker-toggle>
                <mat-datepicker #pd2></mat-datepicker>
              </mat-form-field>
            </div>
            <div class="report-actions">
              <button mat-stroked-button (click)="downloadReport(report, 'excel')">
                <mat-icon>table_chart</mat-icon> Excel
              </button>
              <button mat-stroked-button (click)="downloadReport(report, 'csv')">
                <mat-icon>description</mat-icon> CSV
              </button>
              <button mat-stroked-button color="primary" (click)="viewReport(report)">
                <mat-icon>visibility</mat-icon> View
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="table-card" *ngIf="reportData && activeReport">
        <mat-card-header>
          <mat-card-title>{{ activeReport.title }} Results</mat-card-title>
          <button mat-icon-button (click)="reportData = null; activeReport = null"><mat-icon>close</mat-icon></button>
        </mat-card-header>
        <mat-card-content>
          <pre class="report-json">{{ reportData | json }}</pre>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ReportsComponent {
  reportData: unknown = null;
  activeReport: { endpoint: string; title: string } | null = null;
  private api = inject(ApiService); private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  filterForm = this.fb.group({
    from_date: [null],
    to_date: [null],
  });

  reports = [
    { title: 'Inventory Report', description: 'Current stock levels across all warehouses', endpoint: 'reports/inventory', icon: 'storage', hasDateFilter: false },
    { title: 'Purchase Report', description: 'All purchase orders and amounts', endpoint: 'reports/purchases', icon: 'shopping_cart', hasDateFilter: true },
    { title: 'Sales Report', description: 'All sales orders and revenue', endpoint: 'reports/sales', icon: 'point_of_sale', hasDateFilter: true },
    { title: 'Profit & Loss Report', description: 'Revenue, costs and profit analysis', endpoint: 'reports/profit-loss', icon: 'trending_up', hasDateFilter: true },
  ];

  viewReport(report: { endpoint: string; title: string; hasDateFilter: boolean }): void {
    const params: Record<string, string> = {};
    if (report.hasDateFilter) {
      const { from_date, to_date } = this.filterForm.value;
      if (from_date) params['from_date'] = new Date(from_date).toISOString().split('T')[0];
      if (to_date) params['to_date'] = new Date(to_date).toISOString().split('T')[0];
    }
    this.api.get(report.endpoint, params).subscribe({
      next: res => { this.reportData = res.data; this.activeReport = report; },
      error: () => this.snackBar.open('Failed to load report', 'Close', { duration: 2000 }),
    });
  }

  downloadReport(report: { endpoint: string; title: string; hasDateFilter: boolean }, format: 'excel' | 'csv'): void {
    const params: Record<string, string> = { format };
    if (report.hasDateFilter) {
      const { from_date, to_date } = this.filterForm.value;
      if (from_date) params['from_date'] = new Date(from_date).toISOString().split('T')[0];
      if (to_date) params['to_date'] = new Date(to_date).toISOString().split('T')[0];
    }
    const queryString = new URLSearchParams(params).toString();
    const url = `http://localhost:3000/api/${report.endpoint}?${queryString}`;
    window.open(url, '_blank');
  }
}
