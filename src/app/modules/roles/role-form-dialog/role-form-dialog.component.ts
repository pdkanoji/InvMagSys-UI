import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';
import { createRole, createRoleSuccess, updateRole, updateRoleSuccess, clearRoleError } from '../../../store/roles/roles.actions';
import { selectRolesLoading, selectRolesError } from '../../../store/roles/roles.selectors';
import { Role } from '../../../core/models/role.model';
import { AVAILABLE_PERMISSION_MODULES, PermissionAction, normalizeModulePermissions } from '../../../core/models/permissions.model';

export interface RoleFormDialogData {
  role?: Role;
}

@Component({
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-shell dialog-shell--compact role-dialog-shell">
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

      <mat-dialog-content class="role-dialog-content">
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

          <div class="permission-section">
            <div class="permission-header">
              <h3>Permissions</h3>
              <span>Choose which features this role can access.</span>
            </div>

            <div class="permission-grid">
            <div *ngFor="let module of permissionGroups" class="permission-group">
              <div class="permission-group__header">
                <strong>{{ module.label }}</strong>
                <small>{{ module.description }}</small>
              </div>

              <div class="permission-group__actions">
                <mat-checkbox
                  *ngFor="let action of module.actions"
                  [checked]="hasPermission(module.key, action)"
                  (change)="togglePermission(module.key, action, $event.checked)"
                >
                  {{ action | titlecase }}
                </mat-checkbox>
              </div>
            </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-stroked-button class="dialog-secondary-btn" (click)="onCancel()">Cancel</button>
        <button mat-stroked-button class="dialog-primary-btn" (click)="onSubmit()" [disabled]="form.invalid || (loading$ | async)">
          <mat-spinner diameter="18" *ngIf="loading$ | async; else btnLabel"></mat-spinner>
          <ng-template #btnLabel>{{ isEdit ? 'Save' : 'Create' }}</ng-template>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .role-dialog-shell {
      width: 100%;
      max-height: 90vh;
      box-sizing: border-box;
      gap: 12px;
      padding: 24px;
    }

    .role-dialog-content {
      max-height: min(62vh, 560px);
      overflow-y: auto;
      box-sizing: border-box;
      margin: 0;
      padding: 0 4px 4px 0;
    }

    .role-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .full-width {
      width: 100%;
    }

    .permission-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .permission-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .permission-header h3 {
      margin: 0;
    }

    .permission-header span,
    .permission-group__header small {
      color: #64748b;
    }

    .permission-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .permission-group {
      min-width: 0;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }

    .permission-group__header {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-bottom: 8px;
    }

    .permission-group__actions {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 4px;
    }

    @media (max-width: 600px) {
      .role-dialog-shell {
        padding: 16px;
      }

      .permission-grid {
        grid-template-columns: 1fr;
      }

      .permission-group__actions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `],
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

  permissionGroups = AVAILABLE_PERMISSION_MODULES;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: '',
    permissions: normalizeModulePermissions({}),
  });

  ngOnInit(): void {
    this.store.dispatch(clearRoleError());

    if (this.data?.role) {
      this.isEdit = true;
      const permissions = normalizeModulePermissions(this.data.role.permissions || {});
      this.form.patchValue({
        name: this.data.role.name,
        description: this.data.role.description || '',
        permissions,
      });
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

  hasPermission(moduleKey: string, action: PermissionAction): boolean {
    const permissions = normalizeModulePermissions(this.form.get('permissions')?.value || {});
    return !!permissions[moduleKey]?.[action];
  }

  togglePermission(moduleKey: string, action: PermissionAction, checked: boolean): void {
    const permissions = normalizeModulePermissions(this.form.get('permissions')?.value || {});
    const current = permissions[moduleKey] || { view: false, create: false, edit: false, delete: false };
    permissions[moduleKey] = { ...current, [action]: checked };
    this.form.patchValue({ permissions: normalizeModulePermissions(permissions) });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const permissions = normalizeModulePermissions(this.form.get('permissions')?.value || {});
    const body = {
      name: this.form.value.name!.trim(),
      description: this.form.value.description || undefined,
      permissions,
    };
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
