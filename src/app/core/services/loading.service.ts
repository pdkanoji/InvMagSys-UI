import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private counter = 0;
  private loading$ = new BehaviorSubject<boolean>(false);

  isLoading(): Observable<boolean> { return this.loading$.asObservable(); }

  show(): void {
    this.counter += 1;
    if (this.counter > 0) this.loading$.next(true);
  }

  hide(): void {
    this.counter = Math.max(0, this.counter - 1);
    if (this.counter === 0) this.loading$.next(false);
  }

  reset(): void { this.counter = 0; this.loading$.next(false); }
}
