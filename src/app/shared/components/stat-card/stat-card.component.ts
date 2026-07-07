import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stat-card stat-card--{{ color }}">
      <div class="stat-card__top">
        <span class="stat-card__label">{{ label }}</span>
        <div class="stat-card__icon">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
      </div>
      <div class="stat-card__value">{{ value }}</div>
      <div class="stat-card__footer" *ngIf="trend !== null">
        <span class="stat-card__trend" [class]="trend! >= 0 ? 'stat-card__trend--up' : 'stat-card__trend--down'">
          <mat-icon>{{ trend! >= 0 ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
          {{ trend! | number:'1.1-1' }}%
        </span>
        <span class="stat-card__period">vs last month</span>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() icon = 'info';
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() trend: number | null = null;
}
