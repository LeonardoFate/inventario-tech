// estado-garantia.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoGarantia',
  standalone: true
})
export class EstadoGarantiaPipe implements PipeTransform {
  transform(fechaVencimiento: string | Date): { estado: string; clase: string; dias?: number } {
    if (!fechaVencimiento) {
      return { estado: 'Sin garantía', clase: 'sin-garantia' };
    }
    
    const vencimiento = new Date(fechaVencimiento);
    const ahora = new Date();
    const diferencia = vencimiento.getTime() - ahora.getTime();
    const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) {
      return { 
        estado: 'Vencida', 
        clase: 'garantia-vencida',
        dias: Math.abs(diasRestantes)
      };
    } else if (diasRestantes <= 30) {
      return { 
        estado: 'Por vencer', 
        clase: 'garantia-por-vencer',
        dias: diasRestantes
      };
    } else if (diasRestantes <= 90) {
      return { 
        estado: 'Próxima a vencer', 
        clase: 'garantia-pronto',
        dias: diasRestantes
      };
    } else {
      return { 
        estado: 'Vigente', 
        clase: 'garantia-vigente',
        dias: diasRestantes
      };
    }
  }
}