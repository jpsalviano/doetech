import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor() { }

  handleError(error: any, defaultMessage: string): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error) {
        return error.error;
      }
      if (error.error?.message) {
        return error.error.message;
      }
      if (error.status) {
        return `${error.status}: ${error.statusText || 'Unknown error'}`;
      }
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return defaultMessage;
  }

  getValidationErrorMessage(fieldName: string, errors: any): string {
    if (!errors) return '';

    if (errors.required) {
      return `${fieldName} é obrigatório`;
    } else if (errors.email) {
      return 'Email inválido';
    } else if (errors.minlength) {
      return `${fieldName} deve ter pelo menos ${errors.minlength.requiredLength} caracteres`;
    } else if (errors.pattern) {
      return `Formato inválido`;
    } else if (errors.passwordMismatch) {
      return 'As senhas não coincidem';
    }

    return 'Campo inválido';
  }
}