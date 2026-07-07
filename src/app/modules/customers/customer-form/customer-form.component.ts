import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatSlideToggleModule, MatIconModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">{{ isEdit ? 'Edit Customer' : 'Add Customer' }}</h1></div>
        <a mat-stroked-button routerLink="/customers"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline"><mat-label>Customer Name *</mat-label><input matInput formControlName="name" /><mat-error>Required</mat-error></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" formControlName="email" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Mobile</mat-label><input matInput formControlName="mobile" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>GST Number</mat-label><input matInput formControlName="gst_number" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Credit Limit</mat-label><mat-icon matPrefix>currency_rupee</mat-icon><input matInput type="number" formControlName="credit_limit" min="0" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>City</mat-label><input matInput formControlName="city" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>State</mat-label><input matInput formControlName="state" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Country</mat-label><input matInput formControlName="country" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Pincode</mat-label><input matInput formControlName="pincode" /></mat-form-field>
            <div class="form-col-full"><mat-form-field appearance="outline" class="full-width"><mat-label>Address</mat-label><textarea matInput formControlName="address" rows="3"></textarea></mat-form-field></div>
            <div class="form-col-full toggle-field"><mat-slide-toggle formControlName="is_active" color="primary">Active</mat-slide-toggle></div>
            <div class="form-actions form-col-full">
              <a mat-stroked-button routerLink="/customers">Cancel</a>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class CustomerFormComponent implements OnInit {
  isEdit = false; loading = false;
  private fb = inject(FormBuilder); private router = inject(Router); private route = inject(ActivatedRoute);
  private api = inject(ApiService); private snackBar = inject(MatSnackBar);
  form = this.fb.group({
    name: ['', Validators.required], email: ['', Validators.email], mobile: [''],
    gst_number: [''], credit_limit: [0], address: [''], city: [''], state: [''], country: [''], pincode: [''], is_active: [true],
  });
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.isEdit = true; this.api.get<unknown>(`customers/${id}`).subscribe(r => this.form.patchValue(r.data as object)); }
  }
  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    const obs = id ? this.api.put(`customers/${id}`, this.form.value) : this.api.post('customers', this.form.value);
    obs.subscribe({
      next: () => { this.snackBar.open(this.isEdit ? 'Updated' : 'Created', 'Close', { duration: 2000 }); this.router.navigate(['/customers']); },
      error: () => { this.loading = false; this.snackBar.open('Failed', 'Close', { duration: 2000 }); },
    });
  }
}
