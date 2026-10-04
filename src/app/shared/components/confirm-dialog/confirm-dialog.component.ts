import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  icon?: string;
  iconTone?: 'warning' | 'danger' | 'success' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-shell" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <button mat-icon-button class="dialog-close-btn" mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
      <div class="dialog-header">
        <div class="dialog-icon" [ngClass]="'dialog-icon--' + iconTone">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
        <div class="dialog-content">
          <h2 id="confirm-dialog-title" class="dialog-title">{{ title }}</h2>
          <p class="dialog-subtitle">{{ message }}</p>
        </div>
      </div>
      <div class="dialog-actions">
        <button mat-stroked-button class="dialog-secondary-btn" mat-dialog-close>Cancel</button>
        <button mat-stroked-button class="dialog-danger-btn" [mat-dialog-close]="true">{{ confirmText }}</button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  private dialogData = inject<ConfirmDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>, { optional: true });

  @Input() title = this.dialogData?.title ?? 'Confirm Action';
  @Input() message = this.dialogData?.message ?? 'Are you sure you want to proceed?';
  @Input() confirmText = this.dialogData?.confirmText ?? 'Delete';
  @Input() icon = this.dialogData?.icon ?? 'help_outline';
  @Input() iconTone = this.dialogData?.iconTone ?? 'warning';
}
