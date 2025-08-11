// lazy-load.directive.ts
import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective {
  @Output() appear = new EventEmitter<void>();
  
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {
    this.createObserver();
  }

  private createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.appear.emit();
          this.observer?.unobserve(this.el.nativeElement);
        }
      });
    }, {
      threshold: 0.1
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}