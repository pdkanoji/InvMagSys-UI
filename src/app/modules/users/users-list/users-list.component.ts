import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule, SearchInputComponent, PaginatorComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Users</h1><p class="page-subtitle">Manage system users and permissions</p></div>
        <a mat-flat-button color="primary" routerLink="new"><mat-icon>add</mat-icon> Add User</a>
      </div>
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar"><app-search-input placeholder="Search users..." (searchChange)="onSearch($event)"></app-search-input></div>
          <div class="table-wrapper">
            <table mat-table [dataSource]="items" class="data-table">
              <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let r"><div class="user-cell"><div class="user-avatar">{{ r.first_name?.charAt(0) }}{{ r.last_name?.charAt(0) }}</div><div><div>{{ r.first_name }} {{ r.last_name }}</div><div class="text-muted">{{ r.email }}</div></div></div></td></ng-container>
              <ng-container matColumnDef="role"><th mat-header-cell *matHeaderCellDef>Role</th><td mat-cell *matCellDef="let r"><span class="role-tag">{{ r.roles?.name | titlecase }}</span></td></ng-container>
              <ng-container matColumnDef="phone"><th mat-header-cell *matHeaderCellDef>Phone</th><td mat-cell *matCellDef="let r">{{ r.phone || '-' }}</td></ng-container>
              <ng-container matColumnDef="last_login"><th mat-header-cell *matHeaderCellDef>Last Login</th><td mat-cell *matCellDef="let r">{{ r.last_login_at | date:'short' }}</td></ng-container>
              <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r"><span class="badge" [class]="r.is_active ? 'badge--success' : 'badge--neutral'">{{ r.is_active ? 'Active' : 'Inactive' }}</span></td></ng-container>
              <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th><td mat-cell *matCellDef="let r"><div class="action-buttons"><a mat-icon-button [routerLink]="[r.id, 'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></a><button mat-icon-button color="warn" (click)="onDelete(r)" matTooltip="Delete"><mat-icon>delete</mat-icon></button></div></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;" class="table-row"></tr>
            </table>
          </div>
          <app-paginator [total]="total" [pageSize]="limit" [pageIndex]="page" (pageChange)="onPage($event)"></app-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class UsersListComponent implements OnInit {
  cols = ['name','role','phone','last_login','status','actions'];
  items: User[] = []; total = 0; page = 1; limit = 20; search = '';
  private api = inject(ApiService); private dialog = inject(MatDialog); private snackBar = inject(MatSnackBar);
  ngOnInit(): void { this.load(); }
  load(): void { this.api.get<User[]>('users', { page: this.page, limit: this.limit, search: this.search }).subscribe(r => { this.items = r.data; this.total = r.meta?.total || 0; }); }
  onSearch(s: string): void { this.search = s; this.page = 1; this.load(); }
  onPage(e: { page: number; limit: number }): void { this.page = e.page; this.limit = e.limit; this.load(); }
  onDelete(item: User): void {
    this.dialog.open(ConfirmDialogComponent, { data: { title: 'Delete User', message: `Delete "${item.first_name} ${item.last_name}"?` } }).afterClosed()
      .subscribe(c => { if (c) { this.api.delete(`users/${item.id}`).subscribe(() => { this.snackBar.open('Deleted', 'Close', { duration: 2000 }); this.load(); }); } });
  }
}
