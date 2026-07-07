import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatTabsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">My Profile</h1><p class="page-subtitle">Manage your account details</p></div>
      </div>

      <div class="profile-grid">
        <mat-card class="profile-card">
          <mat-card-content>
            <div class="profile-avatar-section">
              <div class="profile-avatar">
                <img *ngIf="avatarPreview || user?.avatar_url" [src]="avatarPreview || user?.avatar_url" alt="Avatar" />
                <span *ngIf="!avatarPreview && !user?.avatar_url" class="avatar-initials">
                  {{ user?.first_name?.charAt(0) }}{{ user?.last_name?.charAt(0) }}
                </span>
              </div>
              <label class="avatar-upload-btn">
                <mat-icon>camera_alt</mat-icon>
                <input type="file" accept="image/*" hidden (change)="onAvatarSelect($event)" />
              </label>
            </div>
            <div class="profile-info">
              <h2>{{ user?.first_name }} {{ user?.last_name }}</h2>
              <p class="role-badge">{{ user?.roles?.name | titlecase }}</p>
              <p class="text-muted">{{ user?.email }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="form-card">
          <mat-card-content>
            <mat-tab-group>
              <mat-tab label="Personal Info">
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="form-grid tab-form">
                  <mat-form-field appearance="outline"><mat-label>First Name</mat-label><input matInput formControlName="first_name" /></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Last Name</mat-label><input matInput formControlName="last_name" /></mat-form-field>
                  <mat-form-field appearance="outline" class="form-col-full"><mat-label>Phone</mat-label><input matInput formControlName="phone" /></mat-form-field>
                  <div class="form-actions form-col-full">
                    <button mat-flat-button color="primary" type="submit" [disabled]="loading">{{ loading ? 'Saving...' : 'Update Profile' }}</button>
                  </div>
                </form>
              </mat-tab>
              <mat-tab label="Change Password">
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="form-grid tab-form">
                  <mat-form-field appearance="outline" class="form-col-full"><mat-label>Current Password</mat-label><input matInput type="password" formControlName="current_password" /><mat-error>Required</mat-error></mat-form-field>
                  <mat-form-field appearance="outline" class="form-col-full"><mat-label>New Password</mat-label><input matInput type="password" formControlName="new_password" /><mat-error>Min 8 characters</mat-error></mat-form-field>
                  <mat-form-field appearance="outline" class="form-col-full"><mat-label>Confirm Password</mat-label><input matInput type="password" formControlName="confirm_password" /></mat-form-field>
                  <div class="form-actions form-col-full">
                    <button mat-flat-button color="primary" type="submit" [disabled]="passwordLoading">{{ passwordLoading ? 'Updating...' : 'Change Password' }}</button>
                  </div>
                </form>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  loading = false; passwordLoading = false; avatarPreview = ''; selectedFile: File | null = null;
  user: { first_name?: string; last_name?: string; email?: string; avatar_url?: string; roles?: { name: string } } | null = null;
  private fb = inject(FormBuilder); private authService = inject(AuthService);
  private store = inject(Store); private snackBar = inject(MatSnackBar);

  profileForm = this.fb.group({ first_name: [''], last_name: [''], phone: [''] });
  passwordForm = this.fb.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', Validators.required],
  });

  ngOnInit(): void {
    this.store.select(selectCurrentUser).subscribe(user => {
      this.user = user;
      if (user) this.profileForm.patchValue(user);
    });
  }

  onAvatarSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.avatarPreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    this.loading = true;
    const fd = new FormData();
    const values = this.profileForm.value as Record<string, unknown>;
    for (const [k, v] of Object.entries(values)) {
      if (v) fd.append(k, String(v));
    }
    if (this.selectedFile) fd.append('avatar', this.selectedFile);
    this.authService.updateProfile(fd).subscribe({
      next: () => { this.snackBar.open('Profile updated', 'Close', { duration: 2000 }); this.loading = false; },
      error: () => { this.snackBar.open('Update failed', 'Close', { duration: 2000 }); this.loading = false; },
    });
  }

  changePassword(): void {
    const { current_password, new_password, confirm_password } = this.passwordForm.value;
    if (new_password !== confirm_password) { this.snackBar.open('Passwords do not match', 'Close', { duration: 2000 }); return; }
    this.passwordLoading = true;
    this.authService.changePassword(current_password!, new_password!).subscribe({
      next: () => { this.snackBar.open('Password changed', 'Close', { duration: 2000 }); this.passwordForm.reset(); this.passwordLoading = false; },
      error: err => { this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 2000 }); this.passwordLoading = false; },
    });
  }
}
