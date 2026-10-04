import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Purchase } from '../../../core/models/inventory.model';
import { ClearZeroOnFocusDirective } from '../../../shared/directives/clear-zero-on-focus.directive';

@Component({
  selector: 'app-purchase-return-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, ClearZeroOnFocusDirective,
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">New Purchase Return</h1><p class="page-subtitle">Create return against a purchase order</p></div>
        <a mat-stroked-button routerLink="/purchase-returns"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>

      <mat-card class="table-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="return-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Purchase Order</mat-label>
                <mat-select formControlName="purchase_id" (selectionChange)="onPurchaseSelect($event.value)">
                  <mat-option *ngFor="let p of purchases" [value]="p.id">
                    {{ p.purchase_number }} — {{ p.supplier?.name }}
                  </mat-option>
                </mat-select>
                <mat-error>Select a purchase order</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Return Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="return_date" />
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error>Return date is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
                <mat-label>Reason for Return</mat-label>
                <textarea matInput formControlName="reason" rows="2" placeholder="Damaged goods, wrong item, etc."></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
                <mat-label>Notes (optional)</mat-label>
                <textarea matInput formControlName="notes" rows="2"></textarea>
              </mat-form-field>
            </div>

            <h3 class="section-title">Return Items</h3>
            <div class="table-wrapper" style="margin-bottom: 16px;">
              <table class="return-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Max Qty</th>
                    <th>Return Qty</th>
                    <th>Unit Price</th>
                    <th>Tax %</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody formArrayName="items">
                  <tr *ngFor="let item of itemsArray.controls; let i = index" [formGroupName]="i">
                    <td>{{ item.get('product_name')?.value }}</td>
                    <td>{{ item.get('max_qty')?.value }}</td>
                    <td>
                      <mat-form-field appearance="outline" style="width:90px;">
                        <input matInput type="number" formControlName="quantity" min="0.01"
                               [max]="item.get('max_qty')?.value" (input)="calcLine(i)" />
                      </mat-form-field>
                    </td>
                    <td>{{ item.get('unit_price')?.value | currency:'INR' }}</td>
                    <td>{{ item.get('tax_percentage')?.value }}%</td>
                    <td><strong>{{ item.get('total_price')?.value | currency:'INR' }}</strong></td>
                    <td>
                      <button type="button" mat-icon-button color="warn" (click)="removeItem(i)">
                        <mat-icon>remove_circle_outline</mat-icon>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="itemsArray.length === 0">
                    <td colspan="7" style="text-align:center;padding:20px;color:#9aa5b4;">
                      Select a purchase order to load items
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="display:flex;gap:12px;justify-content:flex-end;">
              <a mat-stroked-button routerLink="/purchase-returns">Cancel</a>
              <button mat-stroked-button color="primary" type="submit" [disabled]="form.invalid || itemsArray.length === 0 || saving">
                {{ saving ? 'Saving...' : 'Create Return' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class PurchaseReturnFormComponent implements OnInit {
  purchases: Purchase[] = [];
  saving = false;

  private api = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    purchase_id: ['', Validators.required],
    return_date: [new Date(), Validators.required],
    reason: [''],
    notes: [''],
    items: this.fb.array([]),
  });

  get itemsArray(): FormArray { return this.form.get('items') as FormArray; }

  ngOnInit(): void {
    this.api.get<Purchase[]>('purchases', { limit: 200, status: 'received' }).subscribe(r => this.purchases = r.data);
  }

  onPurchaseSelect(purchaseId: string): void {
    this.itemsArray.clear();
    this.api.get<Purchase>(`purchases/${purchaseId}`).subscribe(r => {
      (r.data.purchase_items || []).forEach(item => {
        this.itemsArray.push(this.fb.group({
          product_id: [item.product_id, Validators.required],
          product_name: [item.product?.name || item.product_id],
          max_qty: [item.quantity],
          quantity: [item.quantity, [Validators.required, Validators.min(0.01)]],
          unit_price: [item.unit_price],
          tax_percentage: [item.tax_percentage || 0],
          total_price: [item.total_price],
        }));
      });
    });
  }

  calcLine(i: number): void {
    const ctrl = this.itemsArray.at(i);
    const qty = parseFloat(ctrl.get('quantity')?.value) || 0;
    const price = parseFloat(ctrl.get('unit_price')?.value) || 0;
    const tax = parseFloat(ctrl.get('tax_percentage')?.value) || 0;
    const total = qty * price * (1 + tax / 100);
    ctrl.get('total_price')?.setValue(+total.toFixed(2), { emitEvent: false });
  }

  removeItem(i: number): void { this.itemsArray.removeAt(i); }

  submit(): void {
    if (this.form.invalid || this.itemsArray.length === 0) return;
    this.saving = true;
    const val = this.form.value;
    const payload = {
      purchase_id: val.purchase_id,
      return_date: val.return_date instanceof Date ? val.return_date.toISOString().split('T')[0] : val.return_date,
      reason: val.reason,
      notes: val.notes,
      items: this.itemsArray.value.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_percentage: item.tax_percentage,
      })),
    };

    this.api.post('purchase-returns', payload).subscribe({
      next: () => {
        this.snackBar.open('Purchase return created', 'Close', { duration: 3000 });
        this.router.navigate(['/purchase-returns']);
      },
      error: (err: any) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to create return', 'Close', { duration: 3000 });
      },
    });
  }
}
