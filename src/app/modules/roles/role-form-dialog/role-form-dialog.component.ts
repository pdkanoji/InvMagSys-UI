import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';
import { createRole, createRoleSuccess, updateRole, updateRoleSuccess, clearRoleError } from '../../../store/roles/roles.actions';
import { selectRolesLoading, selectRolesError } from '../../../store/roles/roles.selectors';
import { Role } from '../../../core/models/role.model';

export interface RoleFormDialogData {
  role?: Role;
}

@Component({
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-shell dialog-shell--compact">
      <button mat-icon-button class="dialog-close-btn" (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
      <div class="dialog-header">
        <div class="dialog-icon dialog-icon--info">
          <mat-icon>admin_panel_settings</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title class="dialog-title">{{ isEdit ? 'Edit Role' : 'Create Role' }}</h2>
          <p class="dialog-subtitle">Define the role name and its description for the access model.</p>
        </div>
      </div>

      <mat-dialog-content>
        <div class="dialog-error" *ngIf="error$ | async as err">{{ err }}</div>

        <form [formGroup]="form" class="role-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g. manager" />
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
            <mat-error *ngIf="form.get('name')?.hasError('minlength')">Minimum 3 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Optional description"></textarea>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-stroked-button class="dialog-secondary-btn" (click)="onCancel()">Cancel</button>
        <button mat-flat-button class="dialog-primary-btn" (click)="onSubmit()" [disabled]="form.invalid || (loading$ | async)">
          <mat-spinner diameter="18" *ngIf="loading$ | async; else btnLabel"></mat-spinner>
          <ng-template #btnLabel>{{ isEdit ? 'Save' : 'Create' }}</ng-template>
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class RoleFormDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private actions$ = inject(Actions);
  private dialogRef = inject(MatDialogRef<RoleFormDialogComponent>);
  data: RoleFormDialogData = inject(MAT_DIALOG_DATA);

  private destroy$ = new Subject<void>();

  loading$ = this.store.select(selectRolesLoading);
  error$ = this.store.select(selectRolesError);

  isEdit = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(clearRoleError());

    if (this.data?.role) {
      this.isEdit = true;
      this.form.patchValue({ name: this.data.role.name, description: this.data.role.description || '' });
    }

    this.actions$.pipe(
      ofType(createRoleSuccess, updateRoleSuccess),
      takeUntil(this.destroy$),
    ).subscribe(() => this.dialogRef.close(true));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const body = { name: this.form.value.name!.trim(), description: this.form.value.description || undefined };
    if (this.isEdit && this.data.role) {
      this.store.dispatch(updateRole({ id: this.data.role.id, body }));
    } else {
      this.store.dispatch(createRole({ body }));
    }
  }

  onCancel(): void {
    this.store.dispatch(clearRoleError());
    this.dialogRef.close(false);
  }
}
