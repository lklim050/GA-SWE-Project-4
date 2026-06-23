import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // inject services into interceptor
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.accessToken;

  // request are immutable hence need to clone
  const authRequest = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error?.msg && Array.isArray(error.error.msg)) {
        const readableMsg = error.error.msg
          .map((error: any) => error.msg)
          .join(', ');
        const normalisedError = new HttpErrorResponse({
          error: { ...error.error, msg: readableMsg },
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url || undefined,
        });
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login']);
        }

        return throwError(() => normalisedError);
      }
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
