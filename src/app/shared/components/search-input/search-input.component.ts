import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule],
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-icon matPrefix>search</mat-icon>
      <input matInput [formControl]="searchControl" [placeholder]="placeholder" />
      <mat-icon matSuffix *ngIf="searchControl.value" (click)="clear()" class="clear-btn">close</mat-icon>
    </mat-form-field>
  `,
})
export class SearchInputComponent {
  @Input() placeholder = 'Search...';
  @Output() searchChange = new EventEmitter<string>();
  searchControl = new FormControl('');

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(value => this.searchChange.emit(value || ''));
  }

  clear(): void {
    this.searchControl.setValue('');
  }
}
