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
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatCardModule, MatDatepickerModule, MatNativeDateModule, MatIconModule, ClearZeroOnFocusDirective],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">New Purchase Order</h1></div>
        <a mat-stroked-button routerLink="/purchases"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Supplier *</mat-label>
                <mat-select formControlName="supplier_id">
                  <mat-option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Warehouse *</mat-label>
                <mat-select formControlName="warehouse_id">
                  <mat-option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Purchase Date *</mat-label>
                <input matInput [matDatepicker]="pd" formControlName="purchase_date" />
                <mat-datepicker-toggle matSuffix [for]="pd"></mat-datepicker-toggle>
                <mat-datepicker #pd></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Due Date</mat-label>
                <input matInput [matDatepicker]="dd" formControlName="due_date" />
                <mat-datepicker-toggle matSuffix [for]="dd"></mat-datepicker-toggle>
                <mat-datepicker #dd></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Discount Amount</mat-label>
                <mat-icon matPrefix>currency_rupee</mat-icon>
                <input matInput type="number" formControlName="discount_amount" min="0" />
              </mat-form-field>
              <div class="form-col-full"><mat-form-field appearance="outline" class="full-width"><mat-label>Notes</mat-label><textarea matInput formControlName="notes" rows="2"></textarea></mat-form-field></div>
            </div>

            <h3 class="section-title">Order Items</h3>
            <div formArrayName="items">
              <div *ngFor="let item of itemsArray.controls; let i = index" [formGroupName]="i" class="order-item-row">
                <mat-form-field appearance="outline" class="item-product">
                  <mat-label>Product</mat-label>
                  <mat-select formControlName="product_id" (selectionChange)="onProductSelect($event, i)">
                    <mat-option *ngFor="let p of products" [value]="p.id">{{ p.name }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="item-qty">
                  <mat-label>Qty</mat-label>
                  <input matInput type="number" formControlName="quantity" min="1" (change)="calcTotals()" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="item-price">
                  <mat-label>Unit Price</mat-label>
                  <mat-icon matPrefix>currency_rupee</mat-icon>
                  <input matInput type="number" formControlName="unit_price" min="0" (change)="calcTotals()" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="item-tax">
                  <mat-label>Tax %</mat-label>
                  <input matInput type="number" formControlName="tax_percentage" min="0" (change)="calcTotals()" />
                </mat-form-field>
                <div class="item-total">{{ getItemTotal(i) | currency:'INR' }}</div>
                <button mat-icon-button color="warn" type="button" (click)="removeItem(i)"><mat-icon>remove_circle</mat-icon></button>
              </div>
            </div>

            <button mat-stroked-button type="button" (click)="addItem()" class="add-item-btn">
              <mat-icon>add</mat-icon> Add Item
            </button>

            <div class="order-summary">
              <div class="summary-row"><span>Subtotal:</span><span>{{ subtotal | currency:'INR' }}</span></div>
              <div class="summary-row"><span>Tax:</span><span>{{ taxAmount | currency:'INR' }}</span></div>
              <div class="summary-row"><span>Discount:</span><span>{{ discountAmount | currency:'INR' }}</span></div>
              <div class="summary-row summary-total"><span>Total:</span><span>{{ total | currency:'INR' }}</span></div>
            </div>

            <div class="form-actions">
              <a mat-stroked-button routerLink="/purchases">Cancel</a>
              <button mat-stroked-button color="primary" type="submit" [disabled]="form.invalid || loading">
                {{ loading ? 'Creating...' : 'Create Purchase Order' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class PurchaseFormComponent implements OnInit {
  loading = false; subtotal = 0; taxAmount = 0; total = 0; discountAmount = 0;
  suppliers: { id: string; name: string }[] = [];
  warehouses: { id: string; name: string }[] = [];
  products: { id: string; name: string; purchase_price: number; tax_percentage: number }[] = [];
  private fb = inject(FormBuilder); private router = inject(Router);
  private api = inject(ApiService); private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    supplier_id: [null, Validators.required],
    warehouse_id: [null, Validators.required],
    purchase_date: [new Date(), Validators.required],
    due_date: [null],
    discount_amount: [0],
    notes: [''],
    items: this.fb.array([]),
  });

  get itemsArray(): FormArray { return this.form.get('items') as FormArray; }

  ngOnInit(): void {
    this.api.get<unknown[]>('suppliers', { limit: 1000 }).subscribe(r => this.suppliers = r.data as { id: string; name: string }[]);
    this.api.get<unknown[]>('warehouses', { limit: 1000 }).subscribe(r => this.warehouses = r.data as { id: string; name: string }[]);
    this.api.get<unknown[]>('products', { limit: 1000, is_active: 'true' }).subscribe(r => this.products = r.data as { id: string; name: string; purchase_price: number; tax_percentage: number }[]);
    this.addItem();
  }

  addItem(): void {
    this.itemsArray.push(this.fb.group({
      product_id: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, Validators.required],
      discount_percentage: [0],
      tax_percentage: [0],
    }));
  }

  removeItem(i: number): void { if (this.itemsArray.length > 1) { this.itemsArray.removeAt(i); this.calcTotals(); } }

  onProductSelect(event: { value: string }, i: number): void {
    const product = this.products.find(p => p.id === event.value);
    if (product) {
      this.itemsArray.at(i).patchValue({ unit_price: product.purchase_price, tax_percentage: product.tax_percentage });
      this.calcTotals();
    }
  }

  getItemTotal(i: number): number {
    const item = this.itemsArray.at(i).value;
    return (item.quantity || 0) * (item.unit_price || 0);
  }

  calcTotals(): void {
    this.subtotal = this.itemsArray.controls.reduce((s, c) => s + (c.value.quantity || 0) * (c.value.unit_price || 0), 0);
    this.taxAmount = this.itemsArray.controls.reduce((s, c) => s + ((c.value.quantity || 0) * (c.value.unit_price || 0) * (c.value.tax_percentage || 0)) / 100, 0);
    this.discountAmount = parseFloat(this.form.value.discount_amount as unknown as string) || 0;
    this.total = this.subtotal + this.taxAmount - this.discountAmount;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const value = { ...this.form.value, purchase_date: new Date(this.form.value.purchase_date!).toISOString().split('T')[0] };
    this.api.post('purchases', value).subscribe({
      next: () => { this.snackBar.open('Purchase order created', 'Close', { duration: 2000 }); this.router.navigate(['/purchases']); },
      error: err => { this.loading = false; this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 2000 }); },
    });
  }
}
