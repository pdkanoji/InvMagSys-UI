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
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Category } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule, SearchInputComponent, PaginatorComponent, EmptyStateComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Categories</h1><p class="page-subtitle">Manage product categories</p></div>
        <a mat-stroked-button color="primary" routerLink="new"><mat-icon>add</mat-icon> Add Category</a>
      </div>
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-toolbar" *ngIf="items.length || search">
            <app-search-input placeholder="Search categories..." (searchChange)="onSearch($event)"></app-search-input>
          </div>
          <div class="table-wrapper" *ngIf="items.length; else emptyCategories">
            <table mat-table [dataSource]="items" class="data-table">
              <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>Code</th><td mat-cell *matCellDef="let r"><span class="code-badge">{{ r.code }}</span></td></ng-container>
              <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let r">{{ r.name }}</td></ng-container>
              <ng-container matColumnDef="parent"><th mat-header-cell *matHeaderCellDef>Parent</th><td mat-cell *matCellDef="let r">{{ r.parent?.name || '-' }}</td></ng-container>
              <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>Description</th><td mat-cell *matCellDef="let r">{{ r.description || '-' }}</td></ng-container>
              <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r"><span class="badge" [class]="r.is_active ? 'badge--success' : 'badge--neutral'">{{ r.is_active ? 'Active' : 'Inactive' }}</span></td></ng-container>
              <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th><td mat-cell *matCellDef="let r"><div class="action-buttons"><a mat-icon-button [routerLink]="[r.id, 'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></a><button mat-icon-button color="warn" (click)="onDelete(r)" matTooltip="Delete"><mat-icon>delete</mat-icon></button></div></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;" class="table-row"></tr>
            </table>
          </div>
          <ng-template #emptyCategories>
            <app-empty-state title="No Records Found" message="No categories have been created yet."></app-empty-state>
          </ng-template>
          <app-paginator *ngIf="items.length" [total]="total" [pageSize]="limit" [pageIndex]="page" (pageChange)="onPage($event)"></app-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class CategoriesListComponent implements OnInit {
  cols = ['code','name','parent','description','status','actions'];
  items: Category[] = []; total = 0; page = 1; limit = 10; search = '';
  private api = inject(ApiService); private dialog = inject(MatDialog); private snackBar = inject(MatSnackBar);

  ngOnInit(): void { this.load(); }
  load(): void {
    this.api.get<Category[]>('categories', { page: this.page, limit: this.limit, search: this.search }).subscribe(r => {
      this.items = r.data; this.total = r.meta?.total || 0;
    });
  }
  onSearch(s: string): void { this.search = s; this.page = 1; this.load(); }
  onPage(e: { page: number; limit: number }): void { this.page = e.page; this.limit = e.limit; this.load(); }
  onDelete(item: Category): void {
    this.dialog.open(ConfirmDialogComponent, { data: { title: 'Delete Category', message: `Delete "${item.name}"?` } })
      .afterClosed().subscribe(c => {
        if (c) {
          this.api.delete(`categories/${item.id}`).subscribe(() => { this.snackBar.open('Deleted', 'Close', { duration: 2000 }); this.load(); });
        }
      });
  }
}
