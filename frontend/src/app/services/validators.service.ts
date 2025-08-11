import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  // Validar cédula ecuatoriana
  static validarCedula(cedula: string): boolean {
    if (!cedula || cedula.length !== 10) return false;
    
    const digits = cedula.split('').map(Number);
    const checkDigit = digits[9];
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let value = digits[i];
      if (i % 2 === 0) {
        value *= 2;
        if (value > 9) value -= 9;
      }
      sum += value;
    }
    
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    return calculatedCheckDigit === checkDigit;
  }

  // Validar email
  static validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar número de serie (formato personalizable)
  static validarNumeroSerie(numeroSerie: string): boolean {
    if (!numeroSerie) return true; // Opcional
    // Formato: al menos 3 caracteres alfanuméricos
    const regex = /^[A-Za-z0-9]{3,}$/;
    return regex.test(numeroSerie);
  }

  // Validar precio
  static validarPrecio(precio: number): boolean {
    return precio >= 0 && precio <= 999999.99;
  }

  // Validar fecha no futura
  static validarFechaNoFutura(fecha: string): boolean {
    const fechaInput = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); // Final del día
    return fechaInput <= hoy;
  }

  // Validar fecha futura (para garantías)
  static validarFechaFutura(fecha: string): boolean {
    const fechaInput = new Date(fecha);
    const hoy = new Date();
    return fechaInput > hoy;
  }

  // Validar contraseña segura
  static validarPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Debe tener al menos 6 caracteres');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validar RUC ecuatoriano
  static validarRUC(ruc: string): boolean {
    if (!ruc || ruc.length !== 13) return false;
    
    // Los primeros 10 dígitos deben ser una cédula válida
    const cedula = ruc.substring(0, 10);
    if (!this.validarCedula(cedula)) return false;
    
    // Los últimos 3 dígitos deben ser "001"
    return ruc.substring(10) === "001";
  }

  // Validar teléfono ecuatoriano
  static validarTelefono(telefono: string): boolean {
    if (!telefono) return true; // Opcional
    // Formato: 10 dígitos, empezando con 0
    const regex = /^0[0-9]{9}$/;
    return regex.test(telefono);
  }

  // Validar código de dispositivo
  static validarCodigoDispositivo(codigo: string): boolean {
    if (!codigo) return false;
    // Formato esperado: CAT-001, LAP-002, etc.
    const regex = /^[A-Z]{3}-\d{3,}$/;
    return regex.test(codigo);
  }

  // Validar archivo subido
  static validarArchivo(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (file.size > maxSize) {
      errors.push('El archivo no puede superar los 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('Tipo de archivo no permitido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Sanitizar entrada de texto
  static sanitizarTexto(texto: string): string {
    if (!texto) return '';
    return texto.trim().replace(/[<>]/g, '');
  }

  // Validar URL
  static validarURL(url: string): boolean {
    if (!url) return true; // Opcional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
    