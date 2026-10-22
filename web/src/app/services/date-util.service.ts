import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilService {

  constructor() { }

  formatDateForDateInput(timestamp: number): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
  }

  formatDateToTimestamp(dateStr: string): number | null {
    if (!dateStr) return null;

    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.getTime();
    }

    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date.getTime();
    }

    return null;
  }

  formatDate(timestamp: number): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('pt-BR');
  }

  formatDateTime(timestamp: number): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('pt-BR');
  }

  getTodayForDateInput(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getTodayTimestamp(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }

  isValidDateString(dateStr: string): boolean {
    return this.formatDateToTimestamp(dateStr) !== null;
  }
}
