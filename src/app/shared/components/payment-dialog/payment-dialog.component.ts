import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';

export interface PaymentDialogData {
  saleId: string;
  saleNumber: string;
  totalAmount: number;
  paidAmount: number;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-shell dialog-shell--compact">
      <button mat-icon-button class="dialog-close-btn" (click)="dialogRef.close()">
        <mat-icon>close</mat-icon>
      </button>
      <div class="dialog-header">
        <div class="dialog-icon dialog-icon--info">
          <mat-icon>payments</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title class="dialog-title">Record Payment</h2>
          <p class="dialog-subtitle">
            Invoice <strong>{{ data.saleNumber }}</strong> &mdash;
            Balance due: <strong>{{ balance | currency:'INR' }}</strong>
          </p>
        </div>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="payment-form">
          <mat-form-field appearance="outline">
            <mat-label>Amount</mat-label>
            <input matInput type="number" formControlName="amount" min="0.01" [max]="balance" />
            <mat-error *ngIf="form.get('amount')?.hasError('required')">Amount is required</mat-error>
            <mat-error *ngIf="form.get('amount')?.hasError('min')">Must be greater than 0</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Payment Method</mat-label>
            <mat-select formControlName="payment_method">
              <mat-option value="cash">Cash</mat-option>
              <mat-option value="bank_transfer">Bank Transfer</mat-option>
              <mat-option value="cheque">Cheque</mat-option>
              <mat-option value="upi">UPI</mat-option>
              <mat-option value="credit_card">Credit Card</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Payment Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="payment_date" />
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Notes (optional)</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>

          <div *ngIf="error" class="payment-dialog-error">{{ error }}</div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-stroked-button class="dialog-secondary-btn" mat-dialog-close [disabled]="saving">Cancel</button>
        <button mat-flat-button class="dialog-primary-btn" (click)="submit()" [disabled]="form.invalid || saving">
          <mat-spinner *ngIf="saving" diameter="18" style="display:inline-block;margin-right:6px;"></mat-spinner>
          Record Payment
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class PaymentDialogComponent {
  data = inject<PaymentDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<PaymentDialogComponent>);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  saving = false;
  error = '';

  get balance(): number {
    return parseFloat(String(this.data.totalAmount)) - parseFloat(String(this.data.paidAmount));
  }

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    payment_method: ['cash', Validators.required],
    payment_date: [new Date(), Validators.required],
    notes: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.error = '';

    const val = this.form.value;
    const payload = {
      amount: val.amount,
      payment_method: val.payment_method,
      payment_date: val.payment_date instanceof Date
        ? val.payment_date.toISOString().split('T')[0]
        : val.payment_date,
      notes: val.notes || null,
    };

    this.api.patch(`sales/${this.data.saleId}/payment`, payload).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.dialogRef.close(res.data);
      },
      error: (err: any) => {
        this.saving = false;
        this.error = err.error?.message || 'Failed to record payment';
      },
    });
  }
}
