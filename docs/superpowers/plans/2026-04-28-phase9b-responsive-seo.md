# Phase 9b — Responsive Design & SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add global SCSS breakpoints, SEO title/description via Angular Title+Meta service, and mobile-responsive styles to all public and patient-facing components.

**Architecture:** Global breakpoints defined in `styles.scss` (values used directly in component SCSS since component styles can't import global vars without angular.json config). `SeoService` wraps Angular `Title`+`Meta`, injected via constructor in each component's `ngOnInit`. Responsive overrides are `@media` blocks appended to each component's existing SCSS — HTML untouched.

**Tech Stack:** Angular 21 standalone, SCSS, Angular `Title` + `Meta` from `@angular/platform-browser`

---

### Task 1: Global breakpoints in `styles.scss` + update `index.html`

**Files:**
- Modify: `src/styles.scss` (lines 1–12)
- Modify: `src/index.html`

- [ ] **Step 1: Add breakpoint variables to `styles.scss`**

After line 11 (`$text-secondary: #888;`), insert three lines before the blank line + `* { box-sizing: border-box; }` block. The result should be:

```scss
// Global color variables — Медлайф palette
$primary-green: #1B7A4A;
$dark-green: #145C38;
$light-green: #E8F5E9;
$accent-green: #4CAF50;
$black: #1A1A1A;
$white: #fff;
$grey: #666;
$light-grey: #F5F5F5;
$border-grey: #E0E0E0;
$text-secondary: #888;

// Global responsive breakpoints
$bp-lg: 1100px;
$bp-md: 768px;
$bp-sm: 480px;

* {
  box-sizing: border-box;
}
```

- [ ] **Step 2: Update `src/index.html`**

Replace the existing `<title>` and add a `<meta name="description">` default tag. Full head section:

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>МЕДЛАЙФ — Медицинский центр</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Качественная медицинская помощь в Кемерово. Запись онлайн." />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add src/styles.scss src/index.html
git commit -m "feat(9b): global breakpoints + index.html title"
```

---

### Task 2: Create `SeoService`

**Files:**
- Create: `src/app/services/seo.service.ts`

- [ ] **Step 1: Create the service file**

```typescript
import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private title: Title, private meta: Meta) {}

  set(title: string, description: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/services/seo.service.ts
git commit -m "feat(9b): SeoService — Title + Meta wrapper"
```

---

### Task 3: SEO in static components (8 components)

Components where title/description are constant strings: `HomeComponent`, `DoctorsComponent`, `ServicesComponent`, `AboutComponent`, `ContactsComponent`, `AuthComponent`, `ProfileComponent`, `MyAppointmentsComponent`, `AppointmentBookingComponent`.

Note: `AuthComponent` currently has no `ngOnInit` — add it. `ContactsComponent` currently has no `ngOnInit` — add it.

**Files:**
- Modify: `src/app/components/home/home.component.ts`
- Modify: `src/app/components/doctors/doctors.component.ts`
- Modify: `src/app/components/services/services.component.ts`
- Modify: `src/app/components/about/about.component.ts`
- Modify: `src/app/components/contacts/contacts.component.ts`
- Modify: `src/app/components/auth/auth.component.ts`
- Modify: `src/app/components/profile/profile.component.ts`
- Modify: `src/app/components/my-appointments/my-appointments.component.ts`
- Modify: `src/app/components/appointment-booking/appointment-booking.component.ts`

- [ ] **Step 1: `home.component.ts` — inject SeoService, call in ngOnInit**

Add `SeoService` import and inject it in constructor. In `ngOnInit`, add as **first line**:

```typescript
import { SeoService } from '../../services/seo.service';
// add to constructor:
// private seo: SeoService
// add as first line of ngOnInit():
this.seo.set('МЕДЛАЙФ — Медицинский центр', 'Качественная медицинская помощь в Кемерово. Запись онлайн.');
```

Full updated constructor line:
```typescript
constructor(private api: ApiService, private toast: ToastService, private router: Router, private cdr: ChangeDetectorRef, private seo: SeoService) {}
```

- [ ] **Step 2: `doctors.component.ts` — inject SeoService, call in ngOnInit**

Add import + inject. Add as first line of `ngOnInit`:
```typescript
this.seo.set('Наши врачи — МЕДЛАЙФ', 'Опытные специалисты клиники МЕДЛАЙФ — кардиология, педиатрия, гастроэнтерология и другие направления.');
```

Updated constructor:
```typescript
constructor(private api: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef, private seo: SeoService) {}
```

- [ ] **Step 3: `services.component.ts` — inject SeoService, call in ngOnInit**

Add import + inject. Add as first line of `ngOnInit`:
```typescript
this.seo.set('Услуги — МЕДЛАЙФ', 'Медицинские услуги клиники МЕДЛАЙФ: диагностика, лечение, консультации специалистов.');
```

Updated constructor:
```typescript
constructor(private api: ApiService, private toast: ToastService, private route: ActivatedRoute, private cdr: ChangeDetectorRef, private seo: SeoService) {}
```

- [ ] **Step 4: `about.component.ts` — inject SeoService, call in ngOnInit**

Add import + inject. Add as first line of `ngOnInit`:
```typescript
this.seo.set('О клинике — МЕДЛАЙФ', 'История, лицензии и преимущества медицинского центра МЕДЛАЙФ с 2011 года.');
```

Updated constructor:
```typescript
constructor(private api: ApiService, private cdr: ChangeDetectorRef, private seo: SeoService) {}
```

- [ ] **Step 5: `contacts.component.ts` — add OnInit + inject SeoService**

Full replacement of the file:
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.set('Контакты — МЕДЛАЙФ', 'Адрес, телефоны и режим работы клиники МЕДЛАЙФ в Кемерово.');
  }
}
```

- [ ] **Step 6: `auth.component.ts` — add OnInit + inject SeoService**

Add `OnInit` to the import, implement `ngOnInit`. The component decorator already says `Component` only — add `OnInit`:

```typescript
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SeoService } from '../../services/seo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  authMode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  passwordConfirm = '';
  name = '';
  loading = false;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.set('Вход — МЕДЛАЙФ', 'Войдите в личный кабинет пациента клиники МЕДЛАЙФ.');
  }

  // toggleMode, onSubmit stay unchanged
```

Keep `toggleMode()` and `onSubmit()` methods exactly as they are.

- [ ] **Step 7: `profile.component.ts` — inject SeoService, call in ngOnInit**

Add import + inject. Add as first line of `ngOnInit`:
```typescript
this.seo.set('Личный кабинет — МЕДЛАЙФ', 'Управление профилем и записями на приём.');
```

Updated constructor:
```typescript
constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef, private seo: SeoService) {}
```

- [ ] **Step 8: `my-appointments.component.ts` — inject SeoService, call in ngOnInit**

Add import + inject. Add as first line of `ngOnInit`:
```typescript
this.seo.set('Мои записи — МЕДЛАЙФ', 'История и предстоящие приёмы в клинике МЕДЛАЙФ.');
```

Updated constructor:
```typescript
constructor(private api: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef, private seo: SeoService) {}
```

- [ ] **Step 9: `appointment-booking.component.ts` — inject SeoService, call in ngOnInit**

Add import + inject. Add as first line of `ngOnInit`:
```typescript
this.seo.set('Запись к врачу — МЕДЛАЙФ', 'Запишитесь к врачу онлайн в клинике МЕДЛАЙФ.');
```

Updated constructor:
```typescript
constructor(private api: ApiService, private toast: ToastService, private router: Router, private cdr: ChangeDetectorRef, private seo: SeoService) {}
```

- [ ] **Step 10: Commit**

```bash
git add src/app/components/home/home.component.ts \
        src/app/components/doctors/doctors.component.ts \
        src/app/components/services/services.component.ts \
        src/app/components/about/about.component.ts \
        src/app/components/contacts/contacts.component.ts \
        src/app/components/auth/auth.component.ts \
        src/app/components/profile/profile.component.ts \
        src/app/components/my-appointments/my-appointments.component.ts \
        src/app/components/appointment-booking/appointment-booking.component.ts
git commit -m "feat(9b): SEO titles/descriptions for static pages"
```

---

### Task 4: SEO in dynamic components (doctor-details, services-detail)

These call `seo.set()` after data loads in the `next:` handler, not in `ngOnInit` body.

**Files:**
- Modify: `src/app/components/doctor-details/doctor-details.component.ts`
- Modify: `src/app/components/services-detail/services-detail.component.ts`

- [ ] **Step 1: `doctor-details.component.ts` — inject SeoService, call after data loads**

Add import + inject. In `ngOnInit`, inside the `api.getDoctor(id).subscribe` `next:` handler, add after `this.doctor = data;`:

```typescript
const spec = data?.specializations?.map((s: any) => s.name).join(', ') || 'специалист';
this.seo.set(
  `${data.fullname} — МЕДЛАЙФ`,
  `Врач ${spec} в клинике МЕДЛАЙФ. Запись онлайн.`
);
```

Updated constructor:
```typescript
constructor(
  private api: ApiService,
  private toast: ToastService,
  private route: ActivatedRoute,
  private router: Router,
  private cdr: ChangeDetectorRef,
  private seo: SeoService,
) {}
```

Full updated `ngOnInit`:
```typescript
ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));
  if (!id) {
    this.toast.error('Некорректный ID врача.');
    this.loading = false;
    return;
  }

  this.api.getDoctor(id).subscribe({
    next: (data) => {
      this.doctor = data;
      const spec = data?.specializations?.map((s: any) => s.name).join(', ') || 'специалист';
      this.seo.set(
        `${data.fullname} — МЕДЛАЙФ`,
        `Врач ${spec} в клинике МЕДЛАЙФ. Запись онлайн.`
      );
      this.loading = false;
      this.cdr.markForCheck();
    },
    error: () => {
      this.toast.error('Не удалось получить данные врача');
      this.loading = false;
      this.cdr.markForCheck();
    },
  });
}
```

- [ ] **Step 2: `services-detail.component.ts` — inject SeoService, call after data loads**

Add import + inject. In the `api.getService(id).subscribe` `next:` handler, add after `this.service = service;`:

```typescript
const desc = service.description
  ? service.description
  : `Услуга ${service.name} в клинике МЕДЛАЙФ.`;
this.seo.set(`${service.name} — МЕДЛАЙФ`, desc);
```

Updated constructor:
```typescript
constructor(
  private api: ApiService,
  private toast: ToastService,
  private route: ActivatedRoute,
  private router: Router,
  private cdr: ChangeDetectorRef,
  private seo: SeoService,
) {}
```

Full updated `ngOnInit`:
```typescript
ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('id');
  const id = Number(idParam);

  if (!id || isNaN(id)) {
    this.toast.error('Некорректный ID услуги');
    this.loading = false;
    return;
  }

  this.api.getService(id).subscribe({
    next: (service) => {
      this.service = service;
      const desc = service.description
        ? service.description
        : `Услуга ${service.name} в клинике МЕДЛАЙФ.`;
      this.seo.set(`${service.name} — МЕДЛАЙФ`, desc);
      this.loading = false;
      this.cdr.markForCheck();
    },
    error: () => {
      this.toast.error('Ошибка загрузки данных услуги');
      this.loading = false;
      this.cdr.markForCheck();
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/components/doctor-details/doctor-details.component.ts \
        src/app/components/services-detail/services-detail.component.ts
git commit -m "feat(9b): SEO titles/descriptions for dynamic pages"
```

---

### Task 5: Responsive SCSS — `home`, `services`, `appointment-booking`

**Files:**
- Modify: `src/app/components/home/home.component.scss`
- Modify: `src/app/components/services/services.component.scss`
- Modify: `src/app/components/appointment-booking/appointment-booking.component.scss`

- [ ] **Step 1: Append to `home.component.scss`**

The file already has 900px and 600px media queries. Append at end of file:

```scss
@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-section,
  .hero-inner {
    padding: 1.5rem 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .diagnostics {
    flex-direction: column;
    gap: 1rem;
  }

  .callback-section {
    padding: 1.5rem 1rem;
  }

  .callback-form {
    width: 100%;

    input,
    textarea {
      width: 100%;
    }
  }
}
```

- [ ] **Step 2: Append to `services.component.scss`**

The file already has 1100px, 900px, 600px media queries. Append at end of file:

```scss
@media (max-width: 480px) {
  .services-grid {
    grid-template-columns: 1fr;
  }

  .category-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
  }
}
```

- [ ] **Step 3: Append to `appointment-booking.component.scss`**

The file only has a 600px media query. Append **before** the existing 600px block (or at the end — order matters: larger bp first). Append at end of file:

```scss
@media (max-width: 768px) {
  .doctor-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .date-grid {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }

  .step-indicator {
    font-size: 0.85rem;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .doctor-grid {
    grid-template-columns: 1fr;
  }

  .step-indicator {
    font-size: 0.75rem;

    .step-label {
      display: none;
    }
  }

  .booking-section {
    padding: 1rem;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/components/home/home.component.scss \
        src/app/components/services/services.component.scss \
        src/app/components/appointment-booking/appointment-booking.component.scss
git commit -m "feat(9b): responsive SCSS — home, services, appointment-booking"
```

---

### Task 6: Responsive SCSS — `services-detail`, `doctor-details`, `about`, `auth`

**Files:**
- Modify: `src/app/components/services-detail/services-detail.component.scss`
- Modify: `src/app/components/doctor-details/doctor-details.component.scss`
- Modify: `src/app/components/about/about.component.scss`
- Modify: `src/app/components/auth/auth.component.scss`

- [ ] **Step 1: Append to `services-detail.component.scss`**

The file only has a 768px media query. Append at end of file:

```scss
@media (max-width: 480px) {
  .detail-card {
    margin: 0;
    border-radius: 0;
    padding: 1rem;
  }

  .back-btn,
  .btn-book {
    width: 100%;
    text-align: center;
  }

  .services-detail-section {
    padding: 1rem 0;
  }
}
```

- [ ] **Step 2: Append to `doctor-details.component.scss`**

The file already has a 768px media query (at line 175). Append at end of file:

```scss
@media (max-width: 480px) {
  .doctor-details-section {
    padding: 0 0.5rem;

    .details-container {
      padding: 1rem;

      .doctor-image-large img {
        height: 220px;
      }

      .doctor-info h1 {
        font-size: 1.5rem;
      }

      .cta-section .btn {
        font-size: 0.95rem;
        padding: 0.85rem;
      }
    }
  }
}
```

- [ ] **Step 3: Append to `about.component.scss`**

The file already has 1000px and 768px media queries. Append at end of file:

```scss
@media (max-width: 480px) {
  .licenses-grid {
    grid-template-columns: 1fr;
  }

  .timeline-item {
    padding: 1rem;
  }

  .about-section,
  .licenses-section {
    padding: 2rem 1rem;
  }
}
```

- [ ] **Step 4: Append to `auth.component.scss`**

The file already has a 568px media query. Append at end of file:

```scss
@media (max-width: 480px) {
  .auth-card {
    box-shadow: none;
    padding: 1.5rem 1rem;
    width: 100%;
    border-radius: 0;
  }

  .auth-section {
    padding: 1rem 0;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/components/services-detail/services-detail.component.scss \
        src/app/components/doctor-details/doctor-details.component.scss \
        src/app/components/about/about.component.scss \
        src/app/components/auth/auth.component.scss
git commit -m "feat(9b): responsive SCSS — services-detail, doctor-details, about, auth"
```

---

### Task 7: Responsive SCSS — `profile`, `my-appointments`, `contacts`

Footer already has both 768px and 480px breakpoints — no changes needed there.

**Files:**
- Modify: `src/app/components/profile/profile.component.scss`
- Modify: `src/app/components/my-appointments/my-appointments.component.scss`
- Modify: `src/app/components/contacts/contacts.component.scss`

- [ ] **Step 1: Append to `profile.component.scss`**

The file already has a 768px media query. Append at end of file:

```scss
@media (max-width: 480px) {
  .profile-section {
    padding: 1rem;
  }

  .profile-actions {
    .btn {
      width: 100%;
      margin-bottom: 0.5rem;
    }
  }

  .tab-content {
    padding: 1rem;
  }

  .appointment-card {
    padding: 1rem;
    font-size: 0.85rem;
  }
}
```

- [ ] **Step 2: Append to `my-appointments.component.scss`**

The file already has a 700px media query. Append at end of file:

```scss
@media (max-width: 480px) {
  .appointment-card {
    padding: 1rem;
    font-size: 0.85rem;
  }

  .cancel-btn,
  .btn-cancel {
    width: 100%;
  }

  .appointments-section {
    padding: 1rem;
  }
}
```

- [ ] **Step 3: Append to `contacts.component.scss`**

The file already has a 768px media query. Append at end of file:

```scss
@media (max-width: 480px) {
  .page-header {
    padding: 1.5rem 0.75rem 1rem;
  }

  .page-header-inner h1 {
    font-size: 1.4rem;
    letter-spacing: 0.5px;
  }

  .map-section iframe {
    height: 240px;
  }

  .address-block {
    flex-direction: column;
    gap: 4px;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/components/profile/profile.component.scss \
        src/app/components/my-appointments/my-appointments.component.scss \
        src/app/components/contacts/contacts.component.scss
git commit -m "feat(9b): responsive SCSS — profile, my-appointments, contacts"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Global breakpoints `$bp-lg`, `$bp-md`, `$bp-sm` → Task 1
- [x] `index.html` title update → Task 1
- [x] `SeoService` with `set(title, description)` → Task 2
- [x] SEO in all 11 components → Tasks 3 + 4
- [x] Dynamic SEO for doctor-details and services-detail → Task 4
- [x] `home.component.scss` 768px + 480px → Task 5
- [x] `services.component.scss` 480px → Task 5
- [x] `appointment-booking.component.scss` 768px + 480px → Task 5
- [x] `services-detail.component.scss` 480px → Task 6
- [x] `doctor-details.component.scss` 480px → Task 6
- [x] `about.component.scss` 480px → Task 6
- [x] `auth.component.scss` 480px → Task 6
- [x] `profile.component.scss` 480px → Task 7
- [x] `my-appointments.component.scss` 480px → Task 7
- [x] `contacts.component.scss` 480px → Task 7
- [x] Footer already has 768px + 480px — no task needed (confirmed in file)
- [x] Admin + doctor panel: excluded per spec

**Placeholder scan:** No TBD/TODO. All code blocks complete.

**Type consistency:** `SeoService.set(title: string, description: string): void` used uniformly across Tasks 3 and 4.
