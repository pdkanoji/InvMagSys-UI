import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state" role="status" aria-live="polite">
      <div class="empty-state__icon" *ngIf="icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3 class="empty-state__title">{{ title }}</h3>
      <p class="empty-state__message" *ngIf="message">{{ message }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = 'No Records Found';
  @Input() message = 'There are no records to display right now.';
  @Input() icon = 'inbox';
}
