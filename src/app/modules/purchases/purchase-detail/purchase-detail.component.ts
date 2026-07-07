import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Purchase } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Purchase Order Detail</h1><p class="page-subtitle">{{ purchase?.purchase_number }}</p></div>
        <div class="header-actions">
          <button mat-stroked-button (click)="downloadPDF()"><mat-icon>picture_as_pdf</mat-icon> Download PDF</button>
          <a mat-stroked-button routerLink="/purchases"><mat-icon>arrow_back</mat-icon> Back</a>
        </div>
      </div>
      <mat-card class="table-card" *ngIf="purchase">
        <mat-card-content>
          <div class="detail-grid">
            <div class="detail-item"><label>PO Number</label><span class="code-badge">{{ purchase.purchase_number }}</span></div>
            <div class="detail-item"><label>Supplier</label><span>{{ purchase.supplier?.name }}</span></div>
            <div class="detail-item"><label>Purchase Date</label><span>{{ purchase.purchase_date | date }}</span></div>
            <div class="detail-item"><label>Due Date</label><span>{{ purchase.due_date | date }}</span></div>
            <div class="detail-item"><label>Status</label><span class="badge" [class]="'badge--' + getStatusColor(purchase.status)">{{ purchase.status }}</span></div>
            <div class="detail-item"><label>Total Amount</label><span class="amount">{{ purchase.total_amount | currency:'INR' }}</span></div>
          </div>

          <h3 class="section-title">Items</h3>
          <table mat-table [dataSource]="purchase.purchase_items || []" class="data-table">
            <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let r">{{ r.product?.name }}</td></ng-container>
            <ng-container matColumnDef="quantity"><th mat-header-cell *matHeaderCellDef>Quantity</th><td mat-cell *matCellDef="let r">{{ r.quantity }} {{ r.product?.unit?.abbreviation }}</td></ng-container>
            <ng-container matColumnDef="unit_price"><th mat-header-cell *matHeaderCellDef>Unit Price</th><td mat-cell *matCellDef="let r">{{ r.unit_price | currency:'INR' }}</td></ng-container>
            <ng-container matColumnDef="tax"><th mat-header-cell *matHeaderCellDef>Tax</th><td mat-cell *matCellDef="let r">{{ r.tax_percentage }}%</td></ng-container>
            <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef>Total</th><td mat-cell *matCellDef="let r">{{ r.total_price | currency:'INR' }}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;" class="table-row"></tr>
          </table>

          <div class="order-summary">
            <div class="summary-row"><span>Subtotal:</span><span>{{ purchase.subtotal | currency:'INR' }}</span></div>
            <div class="summary-row"><span>Tax:</span><span>{{ purchase.tax_amount | currency:'INR' }}</span></div>
            <div class="summary-row"><span>Discount:</span><span>{{ purchase.discount_amount | currency:'INR' }}</span></div>
            <div class="summary-row summary-total"><span>Total:</span><span>{{ purchase.total_amount | currency:'INR' }}</span></div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class PurchaseDetailComponent implements OnInit {
  purchase: Purchase | null = null;
  cols = ['product','quantity','unit_price','tax','total'];
  private api = inject(ApiService); private route = inject(ActivatedRoute); private snackBar = inject(MatSnackBar);
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.api.get<Purchase>(`purchases/${id}`).subscribe(r => this.purchase = r.data);
  }
  getStatusColor(status: string): string {
    return { pending: 'warning', partial: 'info', received: 'success', cancelled: 'danger' }[status] || 'neutral';
  }
  downloadPDF(): void {
    if (!this.purchase) return;
    this.api.getBlob(`purchases/${this.purchase.id}/pdf`).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${this.purchase!.purchase_number}.pdf`; a.click();
      URL.revokeObjectURL(url);
    });
  }
}
