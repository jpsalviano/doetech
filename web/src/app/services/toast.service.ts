import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private defaultDuration = 4000;
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number): void {
    if (!message || !message.trim()) {
      return;
    }

    const toast: Toast = {
      id: this.generateId(),
      message: message.trim(),
      type,
      duration: duration || this.defaultDuration,
      icon: this.getIcon(type)
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    setTimeout(() => {
      this.remove(toast.id);
    }, toast.duration);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private getIcon(type: string): string {
    const iconMap = {
      success: 'bi-check-circle-fill',
      error: 'bi-exclamation-triangle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    return iconMap[type as keyof typeof iconMap] || 'bi-info-circle-fill';
  }
}
