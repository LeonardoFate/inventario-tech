
// solo-numeros.directive.ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appSoloNumeros]',
  standalone: true
})
export class SoloNumerosDirective {
  @Input() permitirDecimales = false;
  @Input() permitirNegativos = false;

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Permitir teclas de control
    if (this.isControlKey(event)) {
      return;
    }
    
    // Permitir números
    if (event.key >= '0' && event.key <= '9') {
      return;
    }
    
    // Permitir punto decimal si está habilitado
    if (this.permitirDecimales && event.key === '.' && !value.includes('.')) {
      return;
    }
    
    // Permitir signo negativo si está habilitado
    if (this.permitirNegativos && event.key === '-' && input.selectionStart === 0 && !value.includes('-')) {
      return;
    }
    
    // Bloquear todo lo demás
    event.preventDefault();
  }

  private isControlKey(event: KeyboardEvent): boolean {
    return event.key === 'Backspace' || 
           event.key === 'Delete' || 
           event.key === 'Tab' || 
           event.key === 'Escape' || 
           event.key === 'Enter' || 
           event.key === 'Home' || 
           event.key === 'End' || 
           event.key === 'ArrowLeft' || 
           event.key === 'ArrowRight' || 
           event.key === 'Clear' || 
           event.key === 'Copy' || 
           event.key === 'Paste' ||
           (event.ctrlKey && (event.key === 'a' || event.key === 'c' || event.key === 'v' || event.key === 'x'));
  }
}

