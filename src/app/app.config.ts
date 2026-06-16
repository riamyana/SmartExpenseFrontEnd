import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { routes } from './app.routes';
import { BASE_PATH } from './services';
import { KeycloakService } from './services/keycloak/keycloak.service';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(
      withInterceptors([authInterceptor])
    ), 
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: BASE_PATH, useValue: 'http://localhost:8000' },
    provideAppInitializer(async () => {
      const keycloakService = inject(KeycloakService);
      await keycloakService.init();
    })
  ]
};
