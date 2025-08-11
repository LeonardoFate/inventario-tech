import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  autoClose?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private currentId = 0;

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  success(title: string, message: string, duration = 5000) {
    this.show('success', title, message, duration);
  }

  error(title: string, message: string, duration = 7000) {
    this.show('error', title, message, duration);
  }

  warning(title: string, message: string, duration = 6000) {
    this.show('warning', title, message, duration);
  }

  info(title: string, message: string, duration = 5000) {
    this.show('info', title, message, duration);
  }

  private show(type: Notification['type'], title: string, message: string, duration: number) {
    const notification: Notification = {
      id: (++this.currentId).toString(),
      type,
      title,
      message,
      duration,
      autoClose: duration > 0
    };

    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

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
}