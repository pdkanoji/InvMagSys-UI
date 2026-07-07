import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';

import { routes } from './app.routes';
import { reducers, metaReducers } from './store';
import { AuthEffects } from './store/auth/auth.effects';
import { ProductEffects } from './store/product/product.effects';
import { PermissionsEffects } from './store/permissions/permissions.effects';
import { RolesEffects } from './store/roles/roles.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    provideStore(reducers, { metaReducers }),
    provideEffects([AuthEffects, ProductEffects, PermissionsEffects, RolesEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
    provideRouterStore(),
  ],
};
