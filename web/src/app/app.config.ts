import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { apiErrorInterceptor } from './interceptors/api-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([apiErrorInterceptor, authInterceptor])
    ),
    provideNgxMask()
  ]
};