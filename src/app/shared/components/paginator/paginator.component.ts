import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="paginator-bar" *ngIf="total > 0">
      <div class="paginator-per-page">
        <span>Items per page:</span>
        <select class="paginator-select" [value]="pageSize" (change)="onSizeChange($event)">
          <option *ngFor="let s of pageSizeOptions" [value]="s">{{ s }}</option>
        </select>
      </div>
      <span class="paginator-range">{{ rangeLabel }}</span>
      <div class="paginator-nav">
        <button class="paginator-btn" (click)="onFirst()" [disabled]="pageIndex <= 1" title="First page">
          <mat-icon>first_page</mat-icon>
        </button>
        <button class="paginator-btn" (click)="onPrev()" [disabled]="pageIndex <= 1" title="Previous page">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button class="paginator-btn" (click)="onNext()" [disabled]="pageIndex >= totalPages" title="Next page">
          <mat-icon>chevron_right</mat-icon>
        </button>
        <button class="paginator-btn" (click)="onLast()" [disabled]="pageIndex >= totalPages" title="Last page">
          <mat-icon>last_page</mat-icon>
        </button>
      </div>
    </div>
    <div class="paginator-summary" *ngIf="total > 0">
      Showing <strong>{{ startItem }}</strong> to <strong>{{ endItem }}</strong> of <strong>{{ total }}</strong> entries
    </div>
  `,
})
export class PaginatorComponent {
  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 1;
  @Output() pageChange = new EventEmitter<{ page: number; limit: number }>();

  pageSizeOptions = [10, 20, 50, 100];

  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  get startItem(): number  { return Math.min((this.pageIndex - 1) * this.pageSize + 1, this.total); }
  get endItem(): number    { return Math.min(this.pageIndex * this.pageSize, this.total); }
  get rangeLabel(): string { return `${this.startItem} - ${this.endItem} of ${this.total}`; }

  onSizeChange(event: Event): void {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageChange.emit({ page: 1, limit: size });
  }

  onFirst(): void { if (this.pageIndex > 1) this.pageChange.emit({ page: 1, limit: this.pageSize }); }
  onPrev(): void  { if (this.pageIndex > 1) this.pageChange.emit({ page: this.pageIndex - 1, limit: this.pageSize }); }
  onNext(): void  { if (this.pageIndex < this.totalPages) this.pageChange.emit({ page: this.pageIndex + 1, limit: this.pageSize }); }
  onLast(): void  { if (this.pageIndex < this.totalPages) this.pageChange.emit({ page: this.totalPages, limit: this.pageSize }); }
}
