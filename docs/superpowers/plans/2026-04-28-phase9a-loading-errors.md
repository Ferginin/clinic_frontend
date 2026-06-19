# Phase 9a — Loading States & Error Handling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add HTTP interceptor with refresh-token retry, MatSnackBar toast notifications, and mat-spinner loading states across all 18 Angular components.

**Architecture:** Functional `HttpInterceptorFn` for JWT injection + 401 refresh; singleton `ToastService` wrapping `MatSnackBar`; shared `SpinnerComponent` replacing all text "Загрузка..." placeholders.

**Tech Stack:** Angular 21, Angular Material 21 (MatSnackBar, MatProgressSpinner), provideHttpClient, provideAnimationsAsync

---

## File Map

**New files:**
- `src/app/interceptors/auth.interceptor.ts`
- `src/app/services/toast.service.ts`
- `src/app/components/shared/spinner/spinner.component.ts`

**Modified files:**
- `src/main.ts` — switch to `provideHttpClient(withInterceptors(...))` + `provideAnimationsAsync()`
- `src/app/services/api.service.ts` — save refresh_token on login, update logout to call backend
- `src/styles.scss` — add toast CSS classes + Material spinner color
- `src/app/components/auth/auth.component.ts` — save refresh_token, use toast
- `src/app/components/auth/auth.component.html` — remove inline message block
- All 15 remaining components with loading/error patterns

---

## Task 1: Update main.ts

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Replace HttpClientModule with provideHttpClient + interceptors**

Replace the entire content of `src/main.ts`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err));
```

- [ ] **Step 2: Verify build still compiles (interceptor file doesn't exist yet — expect import error)**

```bash
cd Clinic_frontend && npx ng build 2>&1 | head -20
```

Expected: error about missing `auth.interceptor` — that's fine, proceed to Task 2.

---

## Task 2: HTTP Auth Interceptor

**Files:**
- Create: `src/app/interceptors/auth.interceptor.ts`

- [ ] **Step 1: Create the interceptor**

```typescript
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
      // Don't retry refresh endpoint itself
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
```

- [ ] **Step 2: Verify build compiles**

```bash
cd Clinic_frontend && npx ng build 2>&1 | tail -5
```

Expected: no errors, build succeeds.

---

## Task 3: Toast Service + Global Styles

**Files:**
- Create: `src/app/services/toast.service.ts`
- Modify: `src/styles.scss`

- [ ] **Step 1: Create ToastService**

```typescript
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration = 3000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['toast-success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  error(message: string, duration = 4000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['toast-error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  info(message: string, duration = 3000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['toast-info'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
```

- [ ] **Step 2: Add toast CSS classes and spinner color to src/styles.scss**

Append to the END of `src/styles.scss`:

```scss
// ── Toast notifications (MatSnackBar) ──────────────────────────────────────
.toast-success .mdc-snackbar__surface {
  background-color: #1b7a4a !important;
  color: #fff !important;
}
.toast-success .mat-mdc-snack-bar-action {
  color: rgba(255, 255, 255, 0.8) !important;
}

.toast-error .mdc-snackbar__surface {
  background-color: #dc2626 !important;
  color: #fff !important;
}
.toast-error .mat-mdc-snack-bar-action {
  color: rgba(255, 255, 255, 0.8) !important;
}

.toast-info .mdc-snackbar__surface {
  background-color: #334155 !important;
  color: #fff !important;
}
.toast-info .mat-mdc-snack-bar-action {
  color: rgba(255, 255, 255, 0.8) !important;
}

// ── Material spinner color ──────────────────────────────────────────────────
.mat-mdc-progress-spinner circle,
.mat-mdc-spinner circle {
  stroke: #1b7a4a !important;
}
```

---

## Task 4: Shared Spinner Component

**Files:**
- Create: `src/app/components/shared/spinner/spinner.component.ts`

- [ ] **Step 1: Create SpinnerComponent**

```typescript
import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="spinner-overlay">
      <mat-progress-spinner mode="indeterminate" [diameter]="48" />
    </div>
  `,
  styles: [`
    .spinner-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      width: 100%;
    }
  `],
})
export class SpinnerComponent {}
```

- [ ] **Step 2: Verify build**

```bash
cd Clinic_frontend && npx ng build 2>&1 | tail -5
```

Expected: build succeeds, no errors.

---

## Task 5: Update ApiService — Refresh Token Storage

**Files:**
- Modify: `src/app/services/api.service.ts`

The `login()` and `register()` methods currently don't save `refresh_token` to localStorage. The interceptor needs it. Also update `logout()` to call the backend and clear the refresh token.

- [ ] **Step 1: Update login and register response handling**

In `api.service.ts`, the `login()` and `register()` methods just return observables — the actual localStorage saving happens in `auth.component.ts`. We need to add a `refreshToken()` method and update `logout()`:

Add after the `register()` method (around line 96):

```typescript
refreshToken(refreshToken: string): Observable<any> {
  return this.http.post(`${API_BASE}/auth/refresh`, { refresh_token: refreshToken });
}

logoutBackend(refreshToken: string): Observable<any> {
  return this.http.post(`${API_BASE}/auth/logout`, { refresh_token: refreshToken });
}
```

Replace the existing `logout()` method:

```typescript
logout(): void {
  const refreshToken = localStorage.getItem('refresh_token');
  if (refreshToken) {
    this.logoutBackend(refreshToken).subscribe({ error: () => {} });
  }
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  this.isAuthenticatedSubject.next(false);
}
```

---

## Task 6: Update auth.component

**Files:**
- Modify: `src/app/components/auth/auth.component.ts`
- Modify: `src/app/components/auth/auth.component.html`

- [ ] **Step 1: Replace auth.component.ts**

```typescript
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  authMode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  passwordConfirm = '';
  name = '';
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  toggleMode(): void {
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
  }

  onSubmit(): void {
    this.loading = true;

    if (this.authMode === 'login') {
      if (!this.email || !this.password) {
        this.toast.error('Заполните все поля');
        this.loading = false;
        return;
      }

      this.api.login({ email: this.email, password: this.password }).subscribe({
        next: (res: any) => {
          const token = res.data?.token || res.token || '';
          const refreshToken = res.data?.refresh_token || res.refresh_token || '';
          const user = res.data?.user || res.user || {};
          localStorage.setItem('token', token);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          this.api.setAuthenticated(true);
          this.loading = false;
          this.router.navigate(['/profile']);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toast.error(err.error?.error || err.error?.message || 'Ошибка входа. Проверьте данные.');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      if (!this.name || !this.email || !this.password || !this.passwordConfirm) {
        this.toast.error('Заполните все поля');
        this.loading = false;
        return;
      }
      if (this.password !== this.passwordConfirm) {
        this.toast.error('Пароли не совпадают');
        this.loading = false;
        return;
      }

      this.api.register({ username: this.name, email: this.email, password: this.password }).subscribe({
        next: (res: any) => {
          const token = res.data?.token || res.token || '';
          const refreshToken = res.data?.refresh_token || res.refresh_token || '';
          const user = res.data?.user || res.user || {};
          localStorage.setItem('token', token);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          this.api.setAuthenticated(true);
          this.loading = false;
          this.router.navigate(['/profile']);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toast.error(err.error?.message || err.error?.error || 'Ошибка регистрации');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
    }
  }
}
```

- [ ] **Step 2: Update auth.component.html — remove inline message block**

Find and remove the message block from `auth.component.html`:
```html
<!-- Message -->
<div *ngIf="message" [class]="'message ' + messageType">
  {{ message }}
</div>
```

The submit button already shows "Загрузка..." via template expression — keep it as-is, no changes needed to the button markup. The `message`/`messageType` properties are removed from the TS class so the `*ngIf="message"` block must be deleted from HTML.

---

## Task 7: Public Components — Spinner + Error Toast

Update the 5 public data-loading components: **doctors**, **services**, **services-detail**, **doctor-details**, **about**.

**Pattern for each:**
1. Add `SpinnerComponent` to `imports` array
2. Inject `private toast: ToastService` in constructor
3. Remove `errorMsg` property
4. Replace `this.errorMsg = '...'` → `this.toast.error('...')`
5. In HTML: replace `<p *ngIf="loading" class="loading">Загрузка...</p>` → `<app-spinner *ngIf="loading" />`
6. In HTML: remove `<p *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</p>`

**Files:**
- Modify: `src/app/components/doctors/doctors.component.ts`
- Modify: `src/app/components/doctors/doctors.component.html`
- Modify: `src/app/components/services/services.component.ts`
- Modify: `src/app/components/services/services.component.html`
- Modify: `src/app/components/services-detail/services-detail.component.ts`
- Modify: `src/app/components/services-detail/services-detail.component.html`
- Modify: `src/app/components/doctor-details/doctor-details.component.ts`
- Modify: `src/app/components/doctor-details/doctor-details.component.html`
- Modify: `src/app/components/about/about.component.ts`
- Modify: `src/app/components/about/about.component.html`

- [ ] **Step 1: Update doctors.component.ts**

In `src/app/components/doctors/doctors.component.ts`:
- Add to imports array: `SpinnerComponent`
- Add to component imports at top: `import { SpinnerComponent } from '../shared/spinner/spinner.component';` and `import { ToastService } from '../../services/toast.service';`
- Add to constructor: `private toast: ToastService`
- Remove property: `errorMsg = '';`
- Replace error callback:
  ```typescript
  error: (err) => {
    this.errorMsg = 'Не удалось загрузить список врачей';
    this.loading = false;
  }
  ```
  with:
  ```typescript
  error: () => {
    this.toast.error('Не удалось загрузить список врачей');
    this.loading = false;
  }
  ```

- [ ] **Step 2: Update doctors.component.html**

Replace:
```html
<p *ngIf="loading" class="loading">Загрузка...</p>
<p *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</p>
```
With:
```html
<app-spinner *ngIf="loading" />
```

Update `*ngIf` on the doctors-grid and no-doctors divs — remove `&& !errorMsg` condition:
```html
<div class="doctors-grid" *ngIf="!loading && doctors.length > 0">
```
```html
<div *ngIf="!loading && doctors.length === 0" class="no-doctors">
```

- [ ] **Step 3: Apply same pattern to services, services-detail, doctor-details, about**

For each remaining component, apply the same TypeScript changes (add SpinnerComponent import, inject ToastService, replace error assignments with toast calls, remove errorMsg property) and HTML changes (replace loading text + error div with `<app-spinner *ngIf="loading" />`).

For `services.component.ts` — replace error handler in `loadServices()`:
```typescript
error: () => {
  this.toast.error('Не удалось загрузить услуги');
  this.loading = false;
}
```

For `services-detail.component.ts` — replace error handler:
```typescript
error: () => {
  this.toast.error('Не удалось загрузить информацию об услуге');
  this.loading = false;
}
```

For `doctor-details.component.ts` — replace error handler:
```typescript
error: () => {
  this.toast.error('Не удалось загрузить информацию о враче');
  this.loading = false;
}
```

For `about.component.ts` — replace error handler:
```typescript
error: () => {
  this.toast.error('Не удалось загрузить лицензии');
  this.loading = false;
}
```

- [ ] **Step 4: Verify build**

```bash
cd Clinic_frontend && npx ng build 2>&1 | tail -10
```

Expected: build succeeds.

---

## Task 8: User Protected Components

Update: **profile**, **appointment-booking**, **my-appointments**.

**Files:**
- Modify: `src/app/components/profile/profile.component.ts`
- Modify: `src/app/components/profile/profile.component.html`
- Modify: `src/app/components/appointment-booking/appointment-booking.component.ts`
- Modify: `src/app/components/appointment-booking/appointment-booking.component.html`
- Modify: `src/app/components/my-appointments/my-appointments.component.ts`
- Modify: `src/app/components/my-appointments/my-appointments.component.html`

- [ ] **Step 1: Update profile.component.ts**

Add imports:
```typescript
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
```

Add `SpinnerComponent` to component `imports` array.

Add `private toast: ToastService` to constructor.

Update `cancelAppointment()` error handler (currently silent `error: () => {}`):
```typescript
cancelAppointment(appointmentId: number): void {
  this.api.cancelAppointment(appointmentId).subscribe({
    next: () => {
      this.toast.success('Запись отменена');
      this.loadAppointments();
    },
    error: () => this.toast.error('Не удалось отменить запись'),
  });
}
```

Update `loadAppointments()` error handler:
```typescript
error: () => {
  this.toast.error('Не удалось загрузить записи');
  this.appointments = [];
  this.appointmentHistory = [];
  this.cdr.markForCheck();
}
```

- [ ] **Step 2: Update profile.component.html**

Find `<div *ngIf="loading"` or `<p *ngIf="loading"` loading indicator and replace with:
```html
<app-spinner *ngIf="loading" />
```

- [ ] **Step 3: Update appointment-booking.component.ts**

Add imports and inject `ToastService`. Add `SpinnerComponent` to imports array.

Find all error handlers that set `this.errorMsg` or similar, replace with `this.toast.error(...)`.

Find success handler for booking creation, add `this.toast.success('Запись создана успешно')`.

Find loading indicators in template (look for `slotsLoading`, `loading`), replace with `<app-spinner *ngIf="slotsLoading" />` and `<app-spinner *ngIf="loading" />`.

- [ ] **Step 4: Update my-appointments.component.ts**

Add imports and inject `ToastService`. Add `SpinnerComponent` to imports array.

Replace error handlers:
```typescript
error: () => {
  this.toast.error('Не удалось загрузить записи');
  this.loading = false;
}
```

For cancel action:
```typescript
next: () => {
  this.toast.success('Запись отменена');
  this.loadAppointments();
},
error: () => this.toast.error('Не удалось отменить запись'),
```

Replace loading HTML with `<app-spinner *ngIf="loading" />`.

---

## Task 9: Admin Components

Update: **admin-dashboard**, **admin-doctors**, **admin-services**, **admin-users**, **admin-appointments**, **admin-callbacks**.

**Files:**
- Modify: `src/app/components/admin/dashboard/admin-dashboard.component.ts` + `.html`
- Modify: `src/app/components/admin/doctors/admin-doctors.component.ts` + `.html`
- Modify: `src/app/components/admin/services/admin-services.component.ts` + `.html`
- Modify: `src/app/components/admin/users/admin-users.component.ts` + `.html`
- Modify: `src/app/components/admin/appointments/admin-appointments.component.ts` + `.html`
- Modify: `src/app/components/admin/callbacks/admin-callbacks.component.ts` + `.html`

**Pattern for each admin component:**
1. Add `SpinnerComponent` to component `imports` array
2. Inject `private toast: ToastService`
3. Replace ALL `this.error = '...'` → `this.toast.error('...')`
4. Remove `error = ''` property
5. Replace all success notifications (currently silent) with `this.toast.success('...')`
6. Replace `<div *ngIf="loading" class="loading-state">Загрузка...</div>` → `<app-spinner *ngIf="loading" />`
7. Remove `<div *ngIf="error" class="error-msg">{{ error }}</div>` from HTML

- [ ] **Step 1: Update admin-doctors.component.ts**

Add imports and inject `ToastService`. Add `SpinnerComponent` to imports array. Remove `error = ''` property.

Replace all error assignments. Example:
```typescript
// Before
error: () => {
  this.error = 'Ошибка загрузки';
  this.loading = false;
}
// After
error: () => {
  this.toast.error('Ошибка загрузки врачей');
  this.loading = false;
}
```

For save/update/delete successes add toasts:
```typescript
next: () => {
  this.toast.success('Врач сохранён');
  this.loadDoctors();
  this.showDoctorModal = false;
}
```
```typescript
next: () => {
  this.toast.success('Врач удалён');
  this.loadDoctors();
}
```

- [ ] **Step 2: Update admin-doctors.component.html**

Replace:
```html
<div *ngIf="loading" class="loading-state">Загрузка...</div>
```
With:
```html
<app-spinner *ngIf="loading" />
```

Remove all `<div *ngIf="error" class="error-msg">{{ error }}</div>` blocks.

- [ ] **Step 3: Apply same pattern to admin-services, admin-users, admin-appointments, admin-callbacks, admin-dashboard**

For each component:
- `admin-services`: toast messages "Услуга сохранена", "Услуга удалена", "Ошибка загрузки услуг"
- `admin-users`: toast messages "Пользователь удалён", "Ошибка загрузки пользователей"
- `admin-appointments`: toast messages "Статус обновлён", "Запись создана", "Ошибка загрузки"
- `admin-callbacks`: toast messages "Статус обновлён", "Заявка удалена", "Ошибка загрузки"
- `admin-dashboard`: toast messages "Ошибка загрузки статистики"

- [ ] **Step 4: Verify build**

```bash
cd Clinic_frontend && npx ng build 2>&1 | tail -10
```

Expected: build succeeds.

---

## Task 10: Doctor Panel Components

Update: **doctor-panel**, **doctor-schedule**, **patient-detail**.

**Files:**
- Modify: `src/app/components/doctor-panel/doctor-panel.component.ts` + `.html`
- Modify: `src/app/components/doctor-panel/doctor-schedule/doctor-schedule.component.ts` + `.html`
- Modify: `src/app/components/doctor-panel/patient-detail/patient-detail.component.ts` + `.html`

- [ ] **Step 1: Update doctor-schedule.component.ts**

Add imports and inject `ToastService`. Add `SpinnerComponent` to imports array.

Replace error handlers:
```typescript
error: () => {
  this.toast.error('Не удалось загрузить расписание');
  this.loading = false;
}
```

- [ ] **Step 2: Update patient-detail.component.ts**

Add imports and inject `ToastService`. Add `SpinnerComponent` to imports array.

Replace error handlers. Add success toast for result submission:
```typescript
next: () => {
  this.toast.success('Результат сохранён');
  // existing navigation
}
error: (e) => {
  this.toast.error(e?.error?.error || 'Ошибка сохранения результата');
}
```

- [ ] **Step 3: Update HTML files for doctor panel components**

Replace all `<div *ngIf="loading" class="loading-state">Загрузка...</div>` → `<app-spinner *ngIf="loading" />`.

Remove `<div *ngIf="error" class="error-msg">{{ error }}</div>` blocks.

- [ ] **Step 4: Final build + serve**

```bash
cd Clinic_frontend && npx ng build 2>&1 | tail -5
```

Expected: build succeeds, 0 errors.

```bash
cd Clinic_frontend && npx ng serve --open
```

Expected: app starts on `http://localhost:4200`. Test:
1. Open any page → no "Загрузка..." text, spinner visible while loading
2. Navigate to `/auth` → login with wrong credentials → red toast appears bottom-center
3. Login successfully → no page reload issues
4. Admin panel → delete/save any entity → green success toast appears
5. DevTools Network → block API server → error toast appears instead of blank/broken page
