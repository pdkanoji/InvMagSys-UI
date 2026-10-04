import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[type="number"]',
  standalone: true,
})
export class ClearZeroOnFocusDirective {
  private el = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl, { optional: true });

  @HostListener('focus')
  onFocus(): void {
    const value = this.el.nativeElement.value;
    if (value === '' || value === null || value === undefined) {
      return;
    }

    const isZero = Number(value) === 0 && !this.el.nativeElement.readOnly;
    if (isZero) {
      this.el.nativeElement.value = '';
      if (this.ngControl?.control) {
        this.ngControl.control.setValue(null, { emitEvent: false });
      }
    }
  }
}
