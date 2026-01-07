import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// token.interceptor.ts
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // SSR check - only run on browser
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const authService = inject(AuthService);
  let token = localStorage.getItem('accessToken');

  // Request clone kore Header boshao
  if (token) {
    req = addTokenHeader(req, token);
  }

  return next(req).pipe(
    // Error Catch kora
    catchError((error) => {
      
      // Jodi Error 401 hoy (Mane Access Token Expired)
      if (error.status === 401) {
         
        // Magic shuru: Refresh Token API call koro
        return authService.refreshToken().pipe(
          switchMap((newTokens: any) => {
            
            // 1. Notun Token save koro
            localStorage.setItem('accessToken', newTokens.accessToken);
            localStorage.setItem('refreshToken', newTokens.refreshToken);

            // 2. Fail howa request ta Abar pathao (Retry)
            // Clone kore notun token boshiye dilam
            return next(addTokenHeader(req, newTokens.accessToken));
          }),
          
          // Refresh Token o jodi expired thake?
          catchError((refreshErr) => {
            authService.logout(); // Force Logout
            return throwError(() => refreshErr);
          })
        );
      }

      // 401 na hole normal error throw koro
      return throwError(() => error);
    })
  );
};

// Helper function
function addTokenHeader(req: HttpRequest<any>, token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}