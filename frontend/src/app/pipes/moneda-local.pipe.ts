// moneda-local.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monedaLocal',
  standalone: true
})
export class MonedaLocalPipe implements PipeTransform {
  transform(value: number, moneda: string = 'USD'): string {
    if (value === null || value === undefined) return '-';
    
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 2
    }).format(value);
  }
}