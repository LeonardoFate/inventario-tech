// resaltar-busqueda.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'resaltarBusqueda',
  standalone: true
})
export class ResaltarBusquedaPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, termino: string): SafeHtml {
    if (!value || !termino) return value;
    
    const regex = new RegExp(`(${termino})`, 'gi');
    const resultado = value.replace(regex, '<mark>$1</mark>');
    
    return this.sanitizer.bypassSecurityTrustHtml(resultado);
  }
}
