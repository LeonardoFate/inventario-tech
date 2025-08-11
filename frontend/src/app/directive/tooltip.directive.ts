import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input('appTooltip') tooltipText = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  
  private tooltip?: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.tooltipText) return;
    
    this.createTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.removeTooltip();
  }

  private createTooltip() {
    this.tooltip = this.renderer.createElement('div');
    this.renderer.appendChild(this.tooltip, this.renderer.createText(this.tooltipText));
    
    this.renderer.addClass(this.tooltip, 'custom-tooltip');
    this.renderer.addClass(this.tooltip, `tooltip-${this.tooltipPosition}`);
    
    this.renderer.appendChild(document.body, this.tooltip);
    
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    
    // Verificar que el tooltip existe antes de obtener su posición
    if (!this.tooltip) return;
    
    const tooltipPos = this.tooltip.getBoundingClientRect();
    
    let top: number, left: number;
    
    switch (this.tooltipPosition) {
      case 'top':
        top = hostPos.top - tooltipPos.height - 5;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'bottom':
        top = hostPos.bottom + 5;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'left':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.left - tooltipPos.width - 5;
        break;
      case 'right':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.right + 5;
        break;
    }
    
    this.renderer.setStyle(this.tooltip, 'position', 'fixed');
    this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
    this.renderer.setStyle(this.tooltip, 'z-index', '9999');
    this.renderer.setStyle(this.tooltip, 'background', '#333');
    this.renderer.setStyle(this.tooltip, 'color', 'white');
    this.renderer.setStyle(this.tooltip, 'padding', '8px 12px');
    this.renderer.setStyle(this.tooltip, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltip, 'font-size', '12px');
    this.renderer.setStyle(this.tooltip, 'max-width', '200px');
    this.renderer.setStyle(this.tooltip, 'word-wrap', 'break-word');
    this.renderer.setStyle(this.tooltip, 'box-shadow', '0 2px 8px rgba(0,0,0,0.2)');
    this.renderer.setStyle(this.tooltip, 'opacity', '0');
    this.renderer.setStyle(this.tooltip, 'transition', 'opacity 0.2s');
    
    // Fade in
    setTimeout(() => {
      if (this.tooltip) {
        this.renderer.setStyle(this.tooltip, 'opacity', '1');
      }
    }, 10);
  }

  private removeTooltip() {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = undefined;
    }
  }
}