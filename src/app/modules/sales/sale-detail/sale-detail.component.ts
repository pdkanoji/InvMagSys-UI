import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../../core/services/api.service';
import { Sale } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Sales Order Detail</h1><p class="page-subtitle">{{ sale?.sale_number }}</p></div>
        <div class="header-actions">
          <button mat-stroked-button (click)="downloadPDF()"><mat-icon>picture_as_pdf</mat-icon> Download Invoice</button>
          <a mat-stroked-button routerLink="/sales"><mat-icon>arrow_back</mat-icon> Back</a>
        </div>
      </div>
      <mat-card class="table-card" *ngIf="sale">
        <mat-card-content>
          <div class="detail-grid">
            <div class="detail-item"><label>Invoice No</label><span class="code-badge">{{ sale.sale_number }}</span></div>
            <div class="detail-item"><label>Customer</label><span>{{ sale.customer?.name || 'Walk-in' }}</span></div>
            <div class="detail-item"><label>Date</label><span>{{ sale.sale_date | date }}</span></div>
            <div class="detail-item"><label>Status</label><span class="badge" [class]="'badge--' + getStatusColor(sale.status)">{{ sale.status }}</span></div>
            <div class="detail-item"><label>Payment</label><span class="badge" [class]="'badge--' + getPaymentColor(sale.payment_status)">{{ sale.payment_status }}</span></div>
            <div class="detail-item"><label>Total</label><span class="amount">{{ sale.total_amount | currency:'INR' }}</span></div>
          </div>
          <h3 class="section-title">Items</h3>
          <table mat-table [dataSource]="sale.sale_items || []" class="data-table">
            <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let r">{{ r.product?.name }}</td></ng-container>
            <ng-container matColumnDef="quantity"><th mat-header-cell *matHeaderCellDef>Quantity</th><td mat-cell *matCellDef="let r">{{ r.quantity }}</td></ng-container>
            <ng-container matColumnDef="unit_price"><th mat-header-cell *matHeaderCellDef>Unit Price</th><td mat-cell *matCellDef="let r">{{ r.unit_price | currency:'INR' }}</td></ng-container>
            <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef>Total</th><td mat-cell *matCellDef="let r">{{ r.total_price | currency:'INR' }}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;" class="table-row"></tr>
          </table>
          <div class="order-summary">
            <div class="summary-row"><span>Subtotal:</span><span>{{ sale.subtotal | currency:'INR' }}</span></div>
            <div class="summary-row"><span>Tax:</span><span>{{ sale.tax_amount | currency:'INR' }}</span></div>
            <div class="summary-row summary-total"><span>Total:</span><span>{{ sale.total_amount | currency:'INR' }}</span></div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class SaleDetailComponent implements OnInit {
  sale: Sale | null = null; cols = ['product','quantity','unit_price','total'];
  private api = inject(ApiService); private route = inject(ActivatedRoute);
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.api.get<Sale>(`sales/${id}`).subscribe(r => this.sale = r.data);
  }
  getStatusColor(s: string): string { return { pending: 'warning', confirmed: 'info', delivered: 'success', cancelled: 'danger' }[s] || 'neutral'; }
  getPaymentColor(s: string): string { return { unpaid: 'danger', partial: 'warning', paid: 'success' }[s] || 'neutral'; }
  downloadPDF(): void {
    if (!this.sale) return;
    this.api.getBlob(`sales/${this.sale.id}/pdf`).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${this.sale!.sale_number}.pdf`; a.click();
      URL.revokeObjectURL(url);
    });
  }
}
