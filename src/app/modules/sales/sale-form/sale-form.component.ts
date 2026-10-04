import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { ClearZeroOnFocusDirective } from '../../../shared/directives/clear-zero-on-focus.directive';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatCardModule, MatDatepickerModule, MatNativeDateModule, MatIconModule, ClearZeroOnFocusDirective],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">New Sales Order</h1></div>
        <a mat-stroked-button routerLink="/sales"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline"><mat-label>Customer</mat-label><mat-select formControlName="customer_id"><mat-option [value]="null">Walk-in Customer</mat-option><mat-option *ngFor="let c of customers" [value]="c.id">{{ c.name }}</mat-option></mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Warehouse *</mat-label><mat-select formControlName="warehouse_id"><mat-option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</mat-option></mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Sale Date *</mat-label><input matInput [matDatepicker]="pd" formControlName="sale_date" /><mat-datepicker-toggle matSuffix [for]="pd"></mat-datepicker-toggle><mat-datepicker #pd></mat-datepicker></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Additional Discount Amount</mat-label><mat-icon matPrefix>currency_rupee</mat-icon><input matInput type="number" formControlName="discount_amount" min="0" (input)="calcTotals()" /></mat-form-field>
              <div class="form-col-full"><mat-form-field appearance="outline" class="full-width"><mat-label>Notes</mat-label><textarea matInput formControlName="notes" rows="2"></textarea></mat-form-field></div>
            </div>

            <h3 class="section-title">Sale Items</h3>
            <div formArrayName="items">
              <div *ngFor="let item of itemsArray.controls; let i = index" [formGroupName]="i" class="sale-order-item-row">
                <mat-form-field appearance="outline" class="item-product"><mat-label>Product</mat-label><mat-select formControlName="product_id" (selectionChange)="onProductSelect($event, i)"><mat-option *ngFor="let p of products" [value]="p.id">{{ p.name }}</mat-option></mat-select></mat-form-field>
                <mat-form-field appearance="outline" class="item-qty"><mat-label>Qty</mat-label><input matInput type="number" formControlName="quantity" min="1" (change)="calcTotals()" /></mat-form-field>
                <mat-form-field appearance="outline" class="item-price"><mat-label>Unit Price</mat-label><mat-icon matPrefix>currency_rupee</mat-icon><input matInput type="number" formControlName="unit_price" min="0" (change)="calcTotals()" /></mat-form-field>
                <mat-form-field appearance="outline" class="item-discount"><mat-label>Discount %</mat-label><input matInput type="number" formControlName="discount_percentage" readonly /></mat-form-field>
                <mat-form-field appearance="outline" class="item-tax"><mat-label>Tax %</mat-label><input matInput type="number" formControlName="tax_percentage" min="0" (change)="calcTotals()" /></mat-form-field>
                <div class="item-total"><span>Line total</span>{{ getItemTotal(i) | currency:'INR' }}</div>
                <button mat-icon-button color="warn" type="button" aria-label="Remove sale item" (click)="removeItem(i)"><mat-icon>remove_circle</mat-icon></button>
              </div>
            </div>
            <button mat-stroked-button type="button" (click)="addItem()"><mat-icon>add</mat-icon> Add Item</button>

            <div class="order-summary">
              <div class="summary-row"><span>Subtotal:</span><span>{{ subtotal | currency:'INR' }}</span></div>
              <div class="summary-row"><span>Total Discount:</span><span>{{ discountAmount | currency:'INR' }}</span></div>
              <div class="summary-row"><span>Tax:</span><span>{{ taxAmount | currency:'INR' }}</span></div>
              <div class="summary-row summary-total"><span>Total:</span><span>{{ total | currency:'INR' }}</span></div>
            </div>

            <div class="form-actions">
              <a mat-stroked-button routerLink="/sales">Cancel</a>
              <button mat-stroked-button color="primary" type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Creating...' : 'Create Sales Order' }}</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .sale-order-item-row {
      display: grid;
      grid-template-columns:
        minmax(160px, 2fr)
        minmax(64px, 0.65fr)
        minmax(112px, 1.2fr)
        minmax(82px, 0.8fr)
        minmax(72px, 0.7fr)
        minmax(96px, 0.9fr)
        40px;
      align-items: start;
      gap: 12px;
      margin-bottom: 12px;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }

    .sale-order-item-row mat-form-field {
      width: 100%;
      min-width: 0;
    }

    .sale-order-item-row .item-total {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      padding-top: 8px;
      text-align: right;
      overflow-wrap: anywhere;
    }

    .sale-order-item-row .item-total span {
      color: #64748b;
      font-size: 12px;
      font-weight: 400;
    }

    .sale-order-item-row button {
      margin-top: 4px;
    }

    @media (max-width: 1100px) {
      .sale-order-item-row {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .sale-order-item-row .item-product {
        grid-column: span 2;
      }

      .sale-order-item-row .item-total {
        text-align: left;
      }
    }

    @media (max-width: 600px) {
      .sale-order-item-row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        padding: 10px;
      }

      .sale-order-item-row .item-product {
        grid-column: 1 / -1;
      }

      .sale-order-item-row .item-total {
        align-self: center;
        padding: 0;
      }

      .sale-order-item-row button {
        justify-self: end;
        margin: 0;
      }
    }
  `],
})
export class SaleFormComponent implements OnInit {
  loading = false; subtotal = 0; discountAmount = 0; taxAmount = 0; total = 0;
  customers: { id: string; name: string }[] = [];
  warehouses: { id: string; name: string }[] = [];
  products: { id: string; name: string; selling_price: number; tax_percentage: number; discount_percentage?: number }[] = [];
  private fb = inject(FormBuilder); private router = inject(Router);
  private api = inject(ApiService); private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    customer_id: [null], warehouse_id: [null, Validators.required], sale_date: [new Date(), Validators.required],
    discount_amount: [0], notes: [''], items: this.fb.array([]),
  });

  get itemsArray(): FormArray { return this.form.get('items') as FormArray; }

  ngOnInit(): void {
    this.api.get<unknown[]>('customers', { limit: 1000 }).subscribe(r => this.customers = r.data as { id: string; name: string }[]);
    this.api.get<unknown[]>('warehouses', { limit: 1000 }).subscribe(r => this.warehouses = r.data as { id: string; name: string }[]);
    this.api.get<unknown[]>('products', { limit: 1000, is_active: 'true' }).subscribe(r => this.products = r.data as { id: string; name: string; selling_price: number; tax_percentage: number; discount_percentage?: number }[]);
    this.addItem();
  }

  addItem(): void {
    this.itemsArray.push(this.fb.group({ product_id: [null, Validators.required], quantity: [1, [Validators.required, Validators.min(1)]], unit_price: [0, Validators.required], discount_percentage: [0], tax_percentage: [0] }));
  }

  removeItem(i: number): void { if (this.itemsArray.length > 1) { this.itemsArray.removeAt(i); this.calcTotals(); } }

  onProductSelect(event: { value: string }, i: number): void {
    const product = this.products.find(p => p.id === event.value);
    if (!product) return;

    const itemControl = this.itemsArray.at(i);
    itemControl.patchValue({
      unit_price: product.selling_price,
      discount_percentage: product.discount_percentage || 0,
      tax_percentage: product.tax_percentage,
    });
    this.calcTotals();

    this.api
      .get<{ price: number }>('sales/last-price', { product_id: product.id, customer_id: this.form.value.customer_id })
      .subscribe({
        next: r => {
          const price = r.data?.price;
          if (price !== null && price !== undefined) {
            itemControl.patchValue({ unit_price: price });
          }
          this.calcTotals();
        },
        error: () => this.calcTotals(),
      });
  }

  getItemTotal(i: number): number {
    const item = this.itemsArray.at(i).value;
    const grossAmount = (item.quantity || 0) * (item.unit_price || 0);
    const discountedAmount = grossAmount * (1 - (item.discount_percentage || 0) / 100);
    return discountedAmount * (1 + (item.tax_percentage || 0) / 100);
  }

  calcTotals(): void {
    const totals = this.itemsArray.controls.reduce((sum, control) => {
      const item = control.value;
      const grossAmount = (item.quantity || 0) * (item.unit_price || 0);
      const lineDiscount = grossAmount * (item.discount_percentage || 0) / 100;
      const taxableAmount = grossAmount - lineDiscount;
      return {
        subtotal: sum.subtotal + grossAmount,
        discountAmount: sum.discountAmount + lineDiscount,
        taxAmount: sum.taxAmount + taxableAmount * (item.tax_percentage || 0) / 100,
      };
    }, { subtotal: 0, discountAmount: 0, taxAmount: 0 });

    this.subtotal = totals.subtotal;
    this.discountAmount = totals.discountAmount + Number(this.form.value.discount_amount || 0);
    this.taxAmount = totals.taxAmount;
    this.total = this.subtotal - this.discountAmount + this.taxAmount;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const value = { ...this.form.value, sale_date: new Date(this.form.value.sale_date!).toISOString().split('T')[0] };
    this.api.post('sales', value).subscribe({
      next: () => { this.snackBar.open('Sale order created', 'Close', { duration: 2000 }); this.router.navigate(['/sales']); },
      error: err => { this.loading = false; this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 2000 }); },
    });
  }
}
