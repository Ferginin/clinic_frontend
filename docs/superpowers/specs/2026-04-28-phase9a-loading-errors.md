# Phase 9a — Loading States & Error Handling Design

## Overview

Улучшение UX Angular-фронтенда клиники: централизованная обработка HTTP-ошибок с автоматическим refresh токена, toast-уведомления через MatSnackBar, единый spinner-компонент вместо текстовых "Загрузка...".

**Стек:** Angular 21, Angular Material (MatSnackBar, MatProgressSpinner), HttpInterceptorFn

---

## Секция 1 — HTTP Interceptor

**Файл:** `src/app/interceptors/auth.interceptor.ts`

**Тип:** Функциональный `HttpInterceptorFn` (Angular 21 standalone-стиль).

**Логика обработки запросов:**
1. Добавляет `Authorization: Bearer <token>` к каждому исходящему запросу (токен из `localStorage.getItem('token')`)
2. При ответе `401 Unauthorized`:
   - Вызывает `POST /api/v1/auth/refresh` с `refresh_token` из localStorage
   - При успехе: сохраняет новые `token` и `refresh_token` в localStorage, повторяет оригинальный запрос с новым токеном
   - При неудаче refresh (или повторный 401): очищает localStorage (`token`, `refresh_token`, `user`), редиректит на `/auth` через `Router`
3. Другие ошибки (`4xx`, `5xx`) пробрасываются дальше — компоненты обрабатывают через toast

**Регистрация:** `main.ts` — `withInterceptors([authInterceptor])` внутри `provideHttpClient()`

**Зависимости:**
- `HttpClient` (для refresh-запроса — инжектируется через `inject()`)
- `Router` (для редиректа — инжектируется через `inject()`)
- `ApiService` НЕ используется напрямую (избегаем циклической зависимости)

---

## Секция 2 — Toast-сервис

**Файл:** `src/app/services/toast.service.ts`

**Обёртка над `MatSnackBar` с тремя методами:**

```typescript
success(message: string, duration = 3000): void
error(message: string, duration = 4000): void
info(message: string, duration = 3000): void
```

**CSS-классы** (добавляются в глобальный `src/styles.scss`):

```scss
.toast-success .mdc-snackbar__surface {
  background-color: #1B7A4A !important;
  color: #fff !important;
}
.toast-error .mdc-snackbar__surface {
  background-color: #dc2626 !important;
  color: #fff !important;
}
.toast-info .mdc-snackbar__surface {
  background-color: #334155 !important;
  color: #fff !important;
}
```

**Снэкбар настройки:** позиция `bottom center`, `panelClass` содержит css-класс типа.

**Регистрация:** `main.ts` добавляет `provideAnimationsAsync()`.

**Внедрение в компоненты:**
- `this.errorMsg = '...'` → `this.toast.error('...')`
- Инлайн-блоки `.error-msg` в шаблонах убираются
- Успешные операции (create, update, delete) получают `this.toast.success('...')`
- Компоненты инжектируют `ToastService` вместо хранения `errorMsg: string`

**Охват компонентов (приоритет):**
1. `auth` — ошибки входа/регистрации
2. `appointment-booking` — ошибки бронирования
3. `profile` — обновление профиля
4. `admin-doctors`, `admin-services`, `admin-users`, `admin-appointments`, `admin-callbacks` — CRUD-операции
5. `doctor-panel`, `patient-detail` — результаты приёма
6. `home`, `doctors`, `services`, `about` — ошибки загрузки данных

---

## Секция 3 — Spinner-компонент

**Файл:** `src/app/components/shared/spinner/spinner.component.ts`

**Standalone-компонент**, импортирует `MatProgressSpinnerModule`.

**Шаблон:**
```html
<div class="spinner-overlay">
  <mat-progress-spinner mode="indeterminate" [diameter]="48" color="primary" />
</div>
```

**SCSS:**
```scss
.spinner-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  width: 100%;
}
```

**Material theme color:** `primary` → задаётся через CSS variables или `theme.scss` как `#1B7A4A`.

**Использование:**
```html
<app-spinner *ngIf="loading" />
<ng-container *ngIf="!loading"><!-- контент --></ng-container>
```

**Внедрение:** все 20 компонентов заменяют `<div class="loading">Загрузка...</div>` на `<app-spinner *ngIf="loading" />`. Логика флагов `loading` не меняется.

---

## Порядок реализации

1. `provideAnimationsAsync()` + `withInterceptors()` в `main.ts`
2. `auth.interceptor.ts` — HTTP interceptor
3. `toast.service.ts` — Toast-сервис
4. `spinner.component.ts` — Shared spinner
5. Обновление `styles.scss` — toast CSS-классы + Material spinner color
6. Внедрение toast во все компоненты (замена `errorMsg`)
7. Внедрение spinner во все компоненты (замена текстовых загрузок)
8. Обновление `ApiService` — добавить методы для работы с refresh токеном (`refreshToken`, `logout`)

---

## Что НЕ входит в Фазу 9а

- Skeleton screens (отложено)
- Responsive/адаптивность (Фаза 9б)
- SEO/meta-теги (Фаза 9б)
- Fallback-страница 404 (минимально — wildcard route уже редиректит на главную)
