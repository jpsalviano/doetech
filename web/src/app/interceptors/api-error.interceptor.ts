import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        if (error.error && typeof error.error === 'object') {
          if (error.error.error) {
            return throwError(() => error.error.error);
          }
          
          const fieldErrors = Object.entries(error.error)
            .filter(([_, value]) => Array.isArray(value) && value.length > 0)
            .map(([field, messages]) => {
              const fieldName = field.split('.').pop() || field;
              return `${fieldName}: ${Array.isArray(messages) ? messages[0] : messages}`;
            });
          
          if (fieldErrors.length > 0) {
            return throwError(() => fieldErrors.join(', '));
          }
        }
        
        if (typeof error.error === 'string') {
          try {
            const parsedError = JSON.parse(error.error);
            
            if (parsedError.error) {
              return throwError(() => parsedError.error);
            }
            
            const fieldErrors = Object.entries(parsedError)
              .filter(([_, value]) => Array.isArray(value) && value.length > 0)
              .map(([field, messages]) => {
                const fieldName = field.split('.').pop() || field;
                return `${fieldName}: ${Array.isArray(messages) ? messages[0] : messages}`;
              });
            
            if (fieldErrors.length > 0) {
              return throwError(() => fieldErrors.join(', '));
            }
          } catch (e) {
            if (error.error) {
              return throwError(() => error.error);
            }
          }
        }
      }
      return throwError(() => error);
    })
  );
};