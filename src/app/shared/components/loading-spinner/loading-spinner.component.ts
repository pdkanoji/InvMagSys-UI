import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
   <div class="global-loading-overlay" *ngIf="isLoading | async">
        <div class="global-loading-card">
            <mat-progress-spinner mode="indeterminate" diameter="48" strokeWidth="4"></mat-progress-spinner>
            <span class="global-loading-text">Loading…</span>
        </div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  private ls = inject(LoadingService);
  isLoading = this.ls.isLoading();
}
