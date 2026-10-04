import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ProductImportSummary } from '../../../core/models/inventory.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-import',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatTableModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">Product Import</h1>
          <p class="page-subtitle">Import products from CSV or Excel files in batches</p>
        </div>
        <a mat-stroked-button routerLink="/products"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="upload-panel">
            <div class="upload-actions">
              <button mat-stroked-button color="primary" (click)="downloadSample()"><mat-icon>download</mat-icon> Download Sample</button>
              <label class="file-picker">
                <input type="file" accept=".csv,.xlsx,.xls" (change)="onFileSelected($event)" />
                <span mat-stroked-button color="primary">Choose file</span>
              </label>
            </div>

            <div *ngIf="selectedFileName" class="selection-note">Selected file: {{ selectedFileName }}</div>

            <div *ngIf="isUploading" class="progress-wrap">
              <div class="progress-label">Processing {{ processedCount }} / {{ totalRecords }} records</div>
              <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
            </div>
          </div>

          <div *ngIf="summary" class="summary-grid">
            <div class="summary-card">
              <span class="summary-label">Processed</span>
              <strong>{{ summary.processed }}</strong>
            </div>
            <div class="summary-card success">
              <span class="summary-label">Imported</span>
              <strong>{{ summary.imported }}</strong>
            </div>
            <div class="summary-card warn">
              <span class="summary-label">Failed</span>
              <strong>{{ summary.failed }}</strong>
            </div>
          </div>

          <div *ngIf="summary && summary.failed_records.length" class="table-wrap">
            <h3>Failed records</h3>
            <table mat-table [dataSource]="summary ? summary.failed_records : []" class="failed-table">
              <ng-container matColumnDef="rowNumber">
                <th mat-header-cell *matHeaderCellDef>Row Number</th>
                <td mat-cell *matCellDef="let row">{{ row.rowNumber }}</td>
              </ng-container>
              <ng-container matColumnDef="product">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let row">{{ row.product }}</td>
              </ng-container>
              <ng-container matColumnDef="reason">
                <th mat-header-cell *matHeaderCellDef>Failure Reason</th>
                <td mat-cell *matCellDef="let row">{{ row.reason }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .page-wrapper { padding: 24px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .page-title { margin: 0; font-size: 2rem; font-weight: 700; }
      .page-subtitle { margin: 4px 0 0; color: #666; }
      .upload-panel { display: grid; gap: 18px; }
      .upload-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
      .file-picker { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
      .file-picker input { display: none; }
      .file-picker span { display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; padding: 0 16px; min-height: 36px; background: #3f51b5; color: white; }
      .selection-note { color: #3f51b5; font-weight: 600; }
      .progress-wrap { display: grid; gap: 8px; }
      .progress-label { font-size: 0.9rem; color: #444; }
      .summary-grid { margin-top: 24px; display: grid; grid-template-columns: repeat(3, minmax(120px, 1fr)); gap: 12px; }
      .summary-card { background: #f5f5f5; border-radius: 12px; padding: 16px; display: grid; gap: 6px; }
      .summary-card.success { background: #e8f5e9; }
      .summary-card.warn { background: #fff3e0; }
      .summary-label { font-size: 0.8rem; color: #666; }
      .summary-card strong { font-size: 1.5rem; }
      .table-wrap { margin-top: 24px; }
      .failed-table { width: 100%; }
      @media (max-width: 640px) { .summary-grid { grid-template-columns: 1fr; } .page-header { display: grid; gap: 12px; } }
    `
  ]
})
export class ProductImportComponent {
  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['rowNumber', 'product', 'reason'];
  selectedFileName = '';
  isUploading = false;
  uploadProgress = 0;
  processedCount = 0;
  totalRecords = 0;
  summary: ProductImportSummary | null = null;
  private selectedFile: File | null = null;

  downloadSample(): void {
    this.productService.downloadSample().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product-import-sample.csv';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Unable to generate sample file', 'Close', { duration: 3000 })
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.summary = null;
    this.isUploading = true;
    this.uploadProgress = 0;
    this.processedCount = 0;
    this.totalRecords = 0;

    this.productService.import(file).subscribe({
      next: (res) => {
        this.summary = res.data;
        this.totalRecords = res.data?.processed ?? 0;
        this.processedCount = res.data?.processed ?? 0;
        this.uploadProgress = 100;
        this.isUploading = false;
        this.snackBar.open(res.message, 'Close', { duration: 4000 });
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadProgress = 0;
        this.snackBar.open(err?.error?.message || 'Import failed', 'Close', { duration: 4000 });
      }
    });
  }
}
