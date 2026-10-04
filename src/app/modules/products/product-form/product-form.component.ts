import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { ApiService } from '../../../core/services/api.service';
import { createProduct, updateProduct } from '../../../store/product/product.actions';
import { ClearZeroOnFocusDirective } from '../../../shared/directives/clear-zero-on-focus.directive';


@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatCardModule, MatSlideToggleModule, MatIconModule, ClearZeroOnFocusDirective],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Product' : 'Add Product' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update product details' : 'Create a new product' }}</p>
        </div>
        <a mat-stroked-button routerLink="/products"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Product Name *</mat-label>
              <input matInput formControlName="name" />
              <mat-error>Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category_id">
                <mat-option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Brand</mat-label>
              <input matInput formControlName="brand" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Unit</mat-label>
              <mat-select formControlName="unit_id">
                <mat-option *ngFor="let u of units" [value]="u.id">{{ u.name }} ({{ u.abbreviation }})</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Purchase Price *</mat-label>
              <mat-icon matPrefix>currency_rupee</mat-icon>
              <input matInput type="number" formControlName="purchase_price" min="0" />
              <mat-error>Purchase price is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Selling Price *</mat-label>
              <mat-icon matPrefix>currency_rupee</mat-icon>
              <input matInput type="number" formControlName="selling_price" min="0" />
              <mat-error>Selling price is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tax Percentage</mat-label>
              <input matInput type="number" formControlName="tax_percentage" min="0" max="100" />
              <span matSuffix>%</span>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Discount Percentage</mat-label>
              <input matInput type="number" formControlName="discount_percentage" min="0" max="100" />
              <span matSuffix>%</span>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Reorder Level</mat-label>
              <input matInput type="number" formControlName="reorder_level" min="0" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Barcode</mat-label>
              <input matInput formControlName="barcode" />
            </mat-form-field>

            <div class="form-col-full">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="form-col-full">
              <label class="file-upload-label">Product Image</label>
              <div class="file-upload-area" (click)="fileInput.click()">
                <img *ngIf="imagePreview" [src]="imagePreview" class="image-preview" alt="" />
                <div *ngIf="!imagePreview" class="file-upload-placeholder">
                  <mat-icon>add_photo_alternate</mat-icon>
                  <span>Click to upload image</span>
                </div>
              </div>
              <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelect($event)" />
            </div>

            <div class="form-col-full toggle-field">
              <mat-slide-toggle formControlName="is_active" color="primary">Active</mat-slide-toggle>
            </div>

            <div class="form-actions form-col-full">
              <a mat-stroked-button routerLink="/products">Cancel</a>
              <button mat-stroked-button color="primary" type="submit" [disabled]="form.invalid || loading">
                {{ loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  isEdit = false; loading = false; imagePreview = ''; selectedFile: File | null = null;
  categories: { id: string; name: string }[] = [];
  units: { id: string; name: string; abbreviation: string }[] = [];
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    name: ['', Validators.required],
    category_id: [null],
    brand: [''],
    unit_id: [null],
    description: [''],
    barcode: [''],
    purchase_price: [0, [Validators.required, Validators.min(0)]],
    selling_price: [0, [Validators.required, Validators.min(0)]],
    tax_percentage: [0],
    discount_percentage: [0],
    reorder_level: [0],
    is_active: [true],
  });

  ngOnInit(): void {
    this.api.get<unknown[]>('categories', { limit: 1000 }).subscribe(r => this.categories = r.data as { id: string; name: string }[]);
    this.api.get<unknown[]>('units').subscribe(r => this.units = r.data as { id: string; name: string; abbreviation: string }[]);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.api.get<unknown>(`products/${id}`).subscribe(r => {
        const p = r.data as Record<string, unknown>;
        this.form.patchValue(p);
        if (p['image_url']) this.imagePreview = p['image_url'] as string;
      });
    }
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const fd = new FormData();
    const values = this.form.value as Record<string, unknown>;
    for (const [k, v] of Object.entries(values)) {
      if (v !== null && v !== undefined) fd.append(k, String(v));
    }
    if (this.selectedFile) fd.append('image', this.selectedFile);

    const id = this.route.snapshot.paramMap.get('id');
    if (this.isEdit && id) {
      this.store.dispatch(updateProduct({ id, formData: fd }));
    } else {
      this.store.dispatch(createProduct({ formData: fd }));
    }

    setTimeout(() => {
      this.loading = false;
      this.snackBar.open(this.isEdit ? 'Product updated' : 'Product created', 'Close', { duration: 3000 });
      this.router.navigate(['/products']);
    }, 800);
  }
}
