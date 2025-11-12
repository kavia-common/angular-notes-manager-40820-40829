import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/**
 * Intercepts HTTP errors globally and reports them via ToastService.
 * This interceptor should be registered app-wide.
 */
// PUBLIC_INTERFACE
export const httpErrorInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  /** This is a public interceptor function handling HTTP errors globally. */
  const toaster = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      const message = formatHttpError(err);
      toaster.error(message);
      return throwError(() => err);
    })
  );
};

function formatHttpError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const status = err.status || 0;
    const statusText = err.statusText || 'Error';
    // Attempt to extract message from response body if present
    const bodyMsg =
      (typeof err.error === 'string' && err.error) ||
      (err.error && (err.error.message || err.error.error)) ||
      err.message ||
      '';
    const summary = bodyMsg ? ` - ${String(bodyMsg)}` : '';
    return `Request failed (${status} ${statusText})${summary}`;
  }
  // Fallback for non-HTTP errors
  try {
    return `Request failed - ${String((err as any)?.message ?? err)}`;
  } catch {
    return 'Request failed - Unknown error';
  }
}
