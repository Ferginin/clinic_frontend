import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, EMPTY } from 'rxjs';
import { environment } from '../../environments/environment';

function clearStorageAndRedirect(router: Router): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  router.navigate(['/auth']);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  const token = localStorage.getItem('token');
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          clearStorageAndRedirect(router);
          return EMPTY;
        }

        return http
          .post<any>(`${environment.apiBaseUrl}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          .pipe(
            switchMap((res: any) => {
              const newToken = res.data?.token || res.token;
              const newRefresh = res.data?.refresh_token || res.refresh_token;
              localStorage.setItem('token', newToken);
              localStorage.setItem('refresh_token', newRefresh);

              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });
              return next(retryReq);
            }),
            catchError(() => {
              clearStorageAndRedirect(router);
              return EMPTY;
            })
          );
      }

      return throwError(() => error);
    })
  );
};
