import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forgotPassword } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-card">
      <h2 class="auth-card__title">Forgot Password</h2>
      <p class="auth-card__subtitle">Enter your email to receive a reset link</p>

      <div class="alert alert--success" *ngIf="sent">
        Reset link sent! Check your email.
      </div>
      <div class="alert alert--error" *ngIf="error$ | async as error">{{ error }}</div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!sent">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email Address</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput type="email" formControlName="email" />
          <mat-error>Valid email required</mat-error>
        </mat-form-field>
        <button mat-flat-button color="primary" type="submit" class="auth-submit" [disabled]="form.invalid || (loading$ | async)">
          <mat-spinner diameter="20" *ngIf="loading$ | async; else btnText"></mat-spinner>
          <ng-template #btnText>Send Reset Link</ng-template>
        </button>
      </form>
      <a routerLink="/auth/login" class="auth-back">Back to Login</a>
    </div>
  `,
})
export class ForgotPasswordComponent {
  sent = false;
  private fb = inject(FormBuilder);
  private store = inject(Store);
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  onSubmit(): void {
    if (this.form.valid) {
      this.store.dispatch(forgotPassword({ email: this.form.value.email! }));
      this.sent = true;
    }
  }
}
