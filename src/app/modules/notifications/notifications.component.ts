import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from '../../core/services/api.service';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { Notification } from '../../core/models/inventory.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatSelectModule, MatFormFieldModule, PaginatorComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div><h1 class="page-title">Notifications</h1></div>
        <div class="header-actions">
          <button mat-stroked-button (click)="checkStock()"><mat-icon>refresh</mat-icon> Check Stock</button>
          <button mat-flat-button (click)="markAllRead()"><mat-icon>done_all</mat-icon> Mark All Read</button>
        </div>
      </div>
      <mat-card class="table-card">
        <mat-card-content>
          <div class="notifications-list">
            <div *ngFor="let n of items" class="notification-item" [class.notification-item--unread]="!n.is_read" (click)="markRead(n)">
              <div class="notification-icon" [class]="'notification-icon--' + n.type">
                <mat-icon>{{ getIcon(n.type) }}</mat-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ n.title }}</div>
                <div class="notification-message">{{ n.message }}</div>
                <div class="notification-time">{{ n.created_at | date:'medium' }}</div>
              </div>
              <div class="notification-badge" *ngIf="!n.is_read"></div>
            </div>
            <div class="no-data" *ngIf="items.length === 0">No notifications</div>
          </div>
          <app-paginator [total]="total" [pageSize]="limit" [pageIndex]="page" (pageChange)="onPage($event)"></app-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  items: Notification[] = []; total = 0; page = 1; limit = 20;
  private api = inject(ApiService); private snackBar = inject(MatSnackBar);
  ngOnInit(): void { this.load(); }
  load(): void { this.api.get<Notification[]>('notifications', { page: this.page, limit: this.limit }).subscribe(r => { this.items = r.data; this.total = r.meta?.total || 0; }); }
  onPage(e: { page: number; limit: number }): void { this.page = e.page; this.limit = e.limit; this.load(); }
  markRead(n: Notification): void {
    if (n.is_read) return;
    this.api.patch(`notifications/${n.id}/read`, {}).subscribe(() => { n.is_read = true; });
  }
  markAllRead(): void {
    this.api.patch('notifications/mark-all-read', {}).subscribe(() => { this.items.forEach(n => n.is_read = true); this.snackBar.open('All marked as read', 'Close', { duration: 2000 }); });
  }
  checkStock(): void {
    this.api.post('notifications/check-stock', {}).subscribe(res => { this.snackBar.open(res.message, 'Close', { duration: 2000 }); this.load(); });
  }
  getIcon(type: string): string {
    return { low_stock: 'warning', out_of_stock: 'error', expiry: 'schedule', pending_payment: 'payment', system: 'info' }[type] || 'notifications';
  }
}
