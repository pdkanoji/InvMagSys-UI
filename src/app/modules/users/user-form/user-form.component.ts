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
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatCardModule, MatSlideToggleModule, MatIconModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">{{ isEdit ? 'Edit User' : 'Add User' }}</h1></div>
        <a mat-stroked-button routerLink="/users"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline"><mat-label>First Name *</mat-label><input matInput formControlName="first_name" /><mat-error>Required</mat-error></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Last Name *</mat-label><input matInput formControlName="last_name" /><mat-error>Required</mat-error></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Email *</mat-label><input matInput type="email" formControlName="email" /><mat-error>Valid email required</mat-error></mat-form-field>
            <mat-form-field appearance="outline" *ngIf="!isEdit"><mat-label>Password *</mat-label><input matInput type="password" formControlName="password" /><mat-error>Min 8 characters</mat-error></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phone" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Role *</mat-label><mat-select formControlName="role_id"><mat-option *ngFor="let r of roles" [value]="r.id">{{ r.name | titlecase }}</mat-option></mat-select><mat-error>Required</mat-error></mat-form-field>
            <div class="form-col-full toggle-field"><mat-slide-toggle formControlName="is_active" color="primary">Active</mat-slide-toggle></div>
            <div class="form-actions form-col-full">
              <a mat-stroked-button routerLink="/users">Cancel</a>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class UserFormComponent implements OnInit {
  isEdit = false; loading = false; roles: { id: string; name: string }[] = [];
  private fb = inject(FormBuilder); private router = inject(Router); private route = inject(ActivatedRoute);
  private api = inject(ApiService); private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    first_name: ['', Validators.required], last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]], password: ['', [Validators.minLength(8)]],
    phone: [''], role_id: ['', Validators.required], is_active: [true],
  });

  ngOnInit(): void {
    this.api.get<unknown[]>('users/roles').subscribe(r => this.roles = r.data as { id: string; name: string }[]);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.api.get<unknown>(`users/${id}`).subscribe(r => this.form.patchValue(r.data as object));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    const body = { ...this.form.value };
    if (!body.password) delete body.password;
    const obs = id ? this.api.put(`users/${id}`, body) : this.api.post('users', body);
    obs.subscribe({
      next: () => { this.snackBar.open(this.isEdit ? 'Updated' : 'Created', 'Close', { duration: 2000 }); this.router.navigate(['/users']); },
      error: err => { this.loading = false; this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 2000 }); },
    });
  }
}
