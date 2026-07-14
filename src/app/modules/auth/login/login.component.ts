import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { login, clearError } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="auth-logo__icon">
          <svg class="auth-logo__img" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="6" fill="#1a2332"/>
            <path d="M10 18L18 10L26 18L18 26L10 18Z" fill="none" stroke="#3d72cf" stroke-width="2"/>
            <path d="M18 14L22 18L18 22L14 18L18 14Z" fill="#3d72cf"/>
          </svg>
          <span class="auth-logo__brand"><strong>XBP</strong>AMERICAS</span>
        </div>
      </div>

      <!-- Title -->
      <h2 class="auth-card__title">Inventory Pro</h2>
      <p class="auth-card__subtitle">Login</p>

      <!-- Error -->
      <div class="alert alert--error" *ngIf="error$ | async as error">
        <mat-icon>error_outline</mat-icon> {{ error }}
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
        <mat-form-field appearance="outline" class="full-width auth-field">
          <mat-label>Username*</mat-label>
          <input matInput type="email" formControlName="email" placeholder="admin@company.com" />
          <mat-icon matSuffix style="color:#9aa5b4;font-size:18px;width:18px;">person</mat-icon>
          <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Invalid email format</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width auth-field">
          <mat-label>Password*</mat-label>
          <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" />
          <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword"
            style="color:#9aa5b4;">
            <mat-icon style="font-size:18px;width:18px;">{{ showPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
          <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
        </mat-form-field>

        <div class="auth-links">
          <!--<a routerLink="/auth/register">Sign up</a>
          <span class="auth-links__sep">|</span>-->
          <a routerLink="/auth/forgot-password">Forgot Password?</a>
        </div>

        <button mat-flat-button type="submit" class="auth-submit"
          [disabled]="loginForm.invalid || (loading$ | async)">
          <mat-spinner diameter="20" *ngIf="loading$ | async; else btnText"></mat-spinner>
          <ng-template #btnText>Login</ng-template>
        </button>
      </form>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  showPassword = false;
  private fb = inject(FormBuilder);
  private store = inject(Store);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  ngOnInit(): void { this.store.dispatch(clearError()); }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.store.dispatch(login({
        credentials: {
          email: this.loginForm.value.email!,
          password: this.loginForm.value.password!,
        },
      }));
    }
  }
}
