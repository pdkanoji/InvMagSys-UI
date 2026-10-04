import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { loadRoles, deleteRole, deleteRoleSuccess, deleteRoleFailure } from '../../../store/roles/roles.actions';
import { selectRoles, selectRolesTotal } from '../../../store/roles/roles.selectors';
import { selectUserRole } from '../../../store/auth/auth.selectors';
import { Role } from '../../../core/models/role.model';
import { RolesService } from '../../../core/services/roles.service';
import { RoleFormDialogComponent } from '../role-form-dialog/role-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatTooltipModule, SearchInputComponent, PaginatorComponent,
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">Roles</h1>
          <p class="page-subtitle">Manage user roles and access levels</p>
        </div>
        <button mat-stroked-button color="primary" *ngIf="(userRole$ | async) === 'super_admin'" (click)="openCreate()">
          <mat-icon>add</mat-icon> Create Role
        </button>
      </div>

      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar">
            <app-search-input placeholder="Search roles..." (searchChange)="onSearch($event)"></app-search-input>
          </div>

          <div class="table-wrapper">
            <table mat-table [dataSource]="(roles$ | async) || []" class="data-table">

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let r">
                  <span class="role-tag">{{ r.name | titlecase }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let r">{{ r.description || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="created_by">
                <th mat-header-cell *matHeaderCellDef>Created By</th>
                <td mat-cell *matCellDef="let r">
                  <span *ngIf="r.created_by_user; else noCreator">
                    {{ r.created_by_user.first_name }} {{ r.created_by_user.last_name }}
                  </span>
                  <ng-template #noCreator>-</ng-template>
                </td>
              </ng-container>

              <ng-container matColumnDef="created_at">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let r">{{ r.created_at | date:'mediumDate' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <div class="action-buttons" *ngIf="(userRole$ | async) === 'super_admin'">
                    <button mat-icon-button (click)="openEdit(r)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="onDelete(r)" matTooltip="Delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;" class="table-row"></tr>
            </table>
          </div>

          <app-paginator
            [total]="(total$ | async) || 0"
            [pageSize]="limit"
            [pageIndex]="page"
            (pageChange)="onPage($event)">
          </app-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class RolesListComponent implements OnInit, OnDestroy {
  cols = ['name', 'description', 'created_by', 'created_at', 'actions'];
  page = 1;
  limit = 10;
  search = '';

  private store = inject(Store);
  private actions$ = inject(Actions);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private rolesService = inject(RolesService);
  private destroy$ = new Subject<void>();

  roles$ = this.store.select(selectRoles);
  total$ = this.store.select(selectRolesTotal);
  userRole$ = this.store.select(selectUserRole);

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.store.dispatch(loadRoles({ params: { page: this.page, limit: this.limit, search: this.search || undefined } }));
  }

  onSearch(s: string): void {
    this.search = s;
    this.page = 1;
    this.load();
  }

  onPage(e: { page: number; limit: number }): void {
    this.page = e.page;
    this.limit = e.limit;
    this.load();
  }

  openCreate(): void {
    this.dialog.open(RoleFormDialogComponent, {
      width: '860px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {},
    })
      .afterClosed().subscribe(saved => {
        if (saved) {
          this.snackBar.open('Role created', 'Close', { duration: 2500 });
          this.load();
        }
      });
  }

  openEdit(role: Role): void {
    this.rolesService.getById(role.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ data }) => this.dialog.open(RoleFormDialogComponent, {
        width: '860px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        data: { role: data },
      })
      .afterClosed().subscribe(saved => {
        if (saved) {
          this.snackBar.open('Role updated', 'Close', { duration: 2500 });
          this.load();
        }
      }),
      error: err => this.snackBar.open(
        err.error?.message || 'Failed to load role permissions',
        'Close',
        { duration: 3000 },
      ),
    });
  }

  onDelete(role: Role): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Role', message: `Delete role "${role.name}"? This will fail if users are assigned to it.` },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.actions$.pipe(
        ofType(deleteRoleSuccess, deleteRoleFailure),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === deleteRoleSuccess.type) {
          this.snackBar.open('Role deleted', 'Close', { duration: 2500 });
          this.load();
        }
      });
      this.store.dispatch(deleteRole({ id: role.id }));
    });
  }
}
