// frontend/src/app/services/notification-improved.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationAdvanced {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  autoClose?: boolean;
  actions?: NotificationAction[];
  persistent?: boolean;
  priority?: 'low' | 'medium' | 'high';
  timestamp?: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationAdvancedService {
  private notifications$ = new BehaviorSubject<NotificationAdvanced[]>([]);
  private currentId = 0;
  private maxNotifications = 5;

  getNotifications(): Observable<NotificationAdvanced[]> {
    return this.notifications$.asObservable();
  }

  success(title: string, message: string, duration = 4000, actions?: NotificationAction[]) {
    this.show('success', title, message, duration, actions);
  }

  error(title: string, message: string, duration = 0, actions?: NotificationAction[]) {
    this.show('error', title, message, duration, actions, true);
  }

  warning(title: string, message: string, duration = 6000, actions?: NotificationAction[]) {
    this.show('warning', title, message, duration, actions);
  }

  info(title: string, message: string, duration = 5000, actions?: NotificationAction[]) {
    this.show('info', title, message, duration, actions);
  }

  // Notificaciones especializadas para el sistema de inventario
  dispositivoCreado(nombre: string, codigo: string) {
    this.success(
      'Dispositivo Creado',
      `${nombre} (${codigo}) se agregó al inventario`,
      4000,
      [
        { label: 'Ver Dispositivo', action: () => this.navigateToDevice(codigo), style: 'primary' }
      ]
    );
  }

  dispositivoAsignado(dispositivo: string, usuario: string) {
    this.info(
      'Dispositivo Asignado',
      `${dispositivo} fue asignado a ${usuario}`,
      5000,
      [
        { label: 'Ver Asignación', action: () => this.navigateToAssignments(), style: 'primary' }
      ]
    );
  }

  garantiaProximaVencer(dispositivos: number) {
    this.warning(
      'Garantías por Vencer',
      `${dispositivos} dispositivos tienen garantía próxima a vencer`,
      0,
      [
        { label: 'Ver Reporte', action: () => this.navigateToReport('garantias'), style: 'primary' },
        { label: 'Recordar Después', action: () => this.snoozeNotification(), style: 'secondary' }
      ]
    );
  }

  backupCompletado(fecha: string) {
    this.success(
      'Backup Completado',
      `Respaldo del sistema completado exitosamente el ${fecha}`,
      3000
    );
  }

  errorConexion() {
    this.error(
      'Error de Conexión',
      'No se pudo conectar con el servidor. Verificando conexión...',
      0,
      [
        { label: 'Reintentar', action: () => this.retryConnection(), style: 'primary' },
        { label: 'Modo Offline', action: () => this.enableOfflineMode(), style: 'secondary' }
      ]
    );
  }

  mantenimientoProgramado(fecha: string, duracion: string) {
    this.warning(
      'Mantenimiento Programado',
      `El sistema estará en mantenimiento el ${fecha} durante ${duracion}`,
      0,
      [
        { label: 'Más Información', action: () => this.showMaintenanceInfo(), style: 'primary' }
      ]
    );
  }

  private show(
    type: NotificationAdvanced['type'], 
    title: string, 
    message: string, 
    duration: number, 
    actions?: NotificationAction[],
    persistent = false,
    priority: NotificationAdvanced['priority'] = 'medium'
  ) {
    const notification: NotificationAdvanced = {
      id: (++this.currentId).toString(),
      type,
      title,
      message,
      duration,
      autoClose: duration > 0 && !persistent,
      actions,
      persistent,
      priority,
      timestamp: new Date()
    };

    const current = this.notifications$.value;
    
    // Gestionar límite de notificaciones
    let updated = [...current, notification];
    if (updated.length > this.maxNotifications) {
      // Remover las más antiguas que no sean persistentes
      updated = updated.filter(n => n.persistent).concat(
        updated.filter(n => !n.persistent).slice(-this.maxNotifications)
      );
    }
    
    // Ordenar por prioridad
    updated.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
    });

    this.notifications$.next(updated);

    if (notification.autoClose) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  remove(id: string) {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.id !== id));
  }

  clear() {
    this.notifications$.next([]);
  }

  clearByType(type: NotificationAdvanced['type']) {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.type !== type));
  }

  // Métodos de navegación (implementar según tu router)
  private navigateToDevice(codigo: string) {
    console.log(`Navegando a dispositivo: ${codigo}`);
    // window.location.href = `/dispositivos?search=${codigo}`;
  }

  private navigateToAssignments() {
    console.log('Navegando a asignaciones');
    // window.location.href = '/asignaciones';
  }

  private navigateToReport(tipo: string) {
    console.log(`Navegando a reporte: ${tipo}`);
    // window.location.href = `/reportes?tipo=${tipo}`;
  }

  private snoozeNotification() {
    console.log('Posponiendo notificación');
    // Implementar lógica de snooze
  }

  private retryConnection() {
    console.log('Reintentando conexión');
    // Implementar lógica de reintento
  }

  private enableOfflineMode() {
    console.log('Habilitando modo offline');
    // Implementar modo offline
  }

  private showMaintenanceInfo() {
    console.log('Mostrando información de mantenimiento');
    // Mostrar modal con info de mantenimiento
  }
}