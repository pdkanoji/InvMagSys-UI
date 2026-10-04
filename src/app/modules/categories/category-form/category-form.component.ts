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
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatCardModule, MatSlideToggleModule, MatIconModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">{{ isEdit ? 'Edit Category' : 'Add Category' }}</h1></div>
        <a mat-stroked-button routerLink="/categories"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline"><mat-label>Category Name *</mat-label><input matInput formControlName="name" /><mat-error>Required</mat-error></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Parent Category</mat-label><mat-select formControlName="parent_id"><mat-option [value]="null">None</mat-option><mat-option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</mat-option></mat-select></mat-form-field>
            <div class="form-col-full"><mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="3"></textarea></mat-form-field></div>
            <div class="form-col-full toggle-field"><mat-slide-toggle formControlName="is_active" color="primary">Active</mat-slide-toggle></div>
            <div class="form-actions form-col-full">
              <a mat-stroked-button routerLink="/categories">Cancel</a>
              <button mat-stroked-button color="primary" type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class CategoryFormComponent implements OnInit {
  isEdit = false; loading = false; categories: { id: string; name: string }[] = [];
  private fb = inject(FormBuilder); private router = inject(Router); private route = inject(ActivatedRoute);
  private api = inject(ApiService); private snackBar = inject(MatSnackBar);
  form = this.fb.group({ name: ['', Validators.required], description: [''], parent_id: [null], is_active: [true] });

  ngOnInit(): void {
    this.api.get<unknown[]>('categories', { limit: 1000 }).subscribe(r => this.categories = r.data as { id: string; name: string }[]);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.isEdit = true; this.api.get<unknown>(`categories/${id}`).subscribe(r => this.form.patchValue(r.data as object)); }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    const obs = id ? this.api.put(`categories/${id}`, this.form.value) : this.api.post('categories', this.form.value);
    obs.subscribe({
      next: () => { this.snackBar.open(this.isEdit ? 'Updated' : 'Created', 'Close', { duration: 2000 }); this.router.navigate(['/categories']); },
      error: () => { this.loading = false; this.snackBar.open('Failed', 'Close', { duration: 2000 }); },
    });
  }
}
