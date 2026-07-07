import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-card">
      <h2 class="auth-card__title">Reset Password</h2>
      <div class="alert alert--success" *ngIf="success">Password reset! You can now <a routerLink="/auth/login">login</a>.</div>
      <div class="alert alert--error" *ngIf="error">{{ error }}</div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!success">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New Password</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input matInput [type]="show ? 'text' : 'password'" formControlName="password" />
          <button mat-icon-button matSuffix type="button" (click)="show = !show"><mat-icon>{{ show ? 'visibility_off' : 'visibility' }}</mat-icon></button>
          <mat-error>Minimum 8 characters required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirm Password</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input matInput [type]="show ? 'text' : 'password'" formControlName="confirm" />
          <mat-error *ngIf="form.hasError('mismatch')">Passwords do not match</mat-error>
        </mat-form-field>
        <button mat-flat-button color="primary" type="submit" class="auth-submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>
    </div>
  `,
})
export class ResetPasswordComponent {
  show = false; success = false; loading = false; error = '';
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
  }, { validators: g => g.get('password')?.value !== g.get('confirm')?.value ? { mismatch: true } : null });

  onSubmit(): void {
    if (this.form.valid) {
      const token = this.route.snapshot.queryParamMap.get('token') || '';
      this.loading = true;
      this.authService.resetPassword(token, this.form.value.password!).subscribe({
        next: () => { this.success = true; this.loading = false; },
        error: err => { this.error = err.error?.message || 'Reset failed'; this.loading = false; },
      });
    }
  }
}
