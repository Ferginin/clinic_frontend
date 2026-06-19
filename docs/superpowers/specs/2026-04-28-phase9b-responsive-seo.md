# Phase 9b — Responsive Design & SEO

## Overview

Финальная полировка Angular-фронтенда клиники: глобальные брейкпоинты, адаптив публичных и пользовательских страниц, SEO-сервис с заголовками и мета-описаниями через Angular Title/Meta.

**Стек:** Angular 21, SCSS, Angular `Title` + `Meta` сервисы

**Область:** только публичные и пользовательские страницы. Admin-панель и панель врача — desktop only, не трогаем.

---

## Секция 1 — Глобальные брейкпоинты

**Файл:** `src/styles.scss`

Добавить в начало файла, после существующих переменных цветов:

```scss
$bp-lg: 1100px;
$bp-md: 768px;
$bp-sm: 480px;
```

Все новые `@media` в компонентах используют эти переменные. Существующие хардкод-значения (900px, 600px и др.) остаются нетронутыми.

---

## Секция 2 — Адаптив компонентов

### Подход

Только `@media` блоки в `component.scss`. HTML не меняется. Паттерн из `doctors.component.scss`: `$bp-lg` (1100px) → `$bp-md` (768px) → `$bp-sm` (480px).

### Компоненты и фиксы

#### `home.component.scss`
- `$bp-md`: `.hero-inner` → `flex-direction: column`, `.hero-title` уменьшить до `2.5rem`, секция статистики (`.stats-grid`) → 1 колонка или 2 колонки, секция диагностики (`.diagnostics`) → вертикальный стек
- `$bp-sm`: `.hero-title` → `2rem`, padding секций уменьшить, callback-форма на всю ширину

#### `services.component.scss`
- `$bp-md`: `.categories-list` (горизонтальный скролл или 2 колонки), `.services-grid` → `repeat(2, 1fr)`
- `$bp-sm`: `.services-grid` → `1fr`, `.category-btn` уменьшить padding

#### `services-detail.component.scss`
- `$bp-md`: padding карточки уменьшить, `.detail-card` max-width 100%
- `$bp-sm`: `.detail-card` — убрать боковые отступы, кнопка назад на всю ширину

#### `doctor-details.component.scss`
- `$bp-md`: layout (фото + инфо) → `flex-direction: column`, `.schedule-grid` → 1 колонка
- `$bp-sm`: кнопка записи — полная ширина, padding уменьшить

#### `about.component.scss`
- `$bp-md`: `.timeline` → вертикальный стек без горизонтального позиционирования, `.licenses-grid` → `repeat(2, 1fr)`
- `$bp-sm`: `.licenses-grid` → `1fr`

#### `auth.component.scss`
- `$bp-sm`: `.auth-card` — убрать `box-shadow`, padding уменьшить, полная ширина на маленьких экранах

#### `profile.component.scss`
- `$bp-md`: `.profile-layout` (если двухколоночный) → одна колонка, tabs — горизонтальный скролл
- `$bp-sm`: кнопки действий — полная ширина, padding уменьшить

#### `my-appointments.component.scss`
- `$bp-md`: таблица записей — убрать малозначимые колонки или перейти на card-layout (`.appointment-card` стек)
- `$bp-sm`: card-layout, шрифт уменьшить

#### `appointment-booking.component.scss`
- `$bp-md`: `.doctor-grid` → `repeat(2, 1fr)`, `.date-grid` → горизонтальный скролл
- `$bp-sm`: `.doctor-grid` → `1fr`, step-индикатор компактный

#### `contacts.component.scss`
- `$bp-md`: layout (карта + контакты) → вертикальный стек
- `$bp-sm`: padding уменьшить

#### `footer.component.scss`
- Проверить существующие 2 media queries — при необходимости добавить `$bp-sm` фикс

---

## Секция 3 — SEO-сервис

### Файл: `src/app/services/seo.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private title: Title, private meta: Meta) {}

  set(title: string, description: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
  }
}
```

Импорты: `Title`, `Meta` из `@angular/platform-browser`.

### Обновление `src/index.html`

```html
<title>МЕДЛАЙФ — Медицинский центр</title>
```

### Внедрение по страницам

Каждый компонент инжектирует `SeoService` и вызывает `this.seo.set(title, description)` в `ngOnInit`. Для динамических страниц (doctor-details, services-detail) — вызов после загрузки данных в `next:` обработчике.

| Компонент | Title | Description |
|---|---|---|
| `HomeComponent` | `МЕДЛАЙФ — Медицинский центр` | `Качественная медицинская помощь в Кемерово. Запись онлайн.` |
| `DoctorsComponent` | `Наши врачи — МЕДЛАЙФ` | `Опытные специалисты клиники МЕДЛАЙФ — кардиология, педиатрия, гастроэнтерология и другие направления.` |
| `DoctorDetailsComponent` | `{doctor.fullname} — МЕДЛАЙФ` | `Врач {specialization} в клинике МЕДЛАЙФ. Запись онлайн.` |
| `ServicesComponent` | `Услуги — МЕДЛАЙФ` | `Медицинские услуги клиники МЕДЛАЙФ: диагностика, лечение, консультации специалистов.` |
| `ServicesDetailComponent` | `{service.name} — МЕДЛАЙФ` | `{service.description}` (если есть), иначе `Услуга {service.name} в клинике МЕДЛАЙФ.` |
| `AboutComponent` | `О клинике — МЕДЛАЙФ` | `История, лицензии и преимущества медицинского центра МЕДЛАЙФ с 2011 года.` |
| `ContactsComponent` | `Контакты — МЕДЛАЙФ` | `Адрес, телефоны и режим работы клиники МЕДЛАЙФ в Кемерово.` |
| `AuthComponent` | `Вход — МЕДЛАЙФ` | `Войдите в личный кабинет пациента клиники МЕДЛАЙФ.` |
| `ProfileComponent` | `Личный кабинет — МЕДЛАЙФ` | `Управление профилем и записями на приём.` |
| `MyAppointmentsComponent` | `Мои записи — МЕДЛАЙФ` | `История и предстоящие приёмы в клинике МЕДЛАЙФ.` |
| `AppointmentBookingComponent` | `Запись к врачу — МЕДЛАЙФ` | `Запишитесь к врачу онлайн в клинике МЕДЛАЙФ.` |

---

## Порядок реализации

1. Глобальные брейкпоинты в `styles.scss` + обновить `index.html`
2. `seo.service.ts` — создать сервис
3. Внедрить SEO во все 11 компонентов
4. Адаптив: `home`, `services`, `appointment-booking` (наиболее сложные)
5. Адаптив: `services-detail`, `doctor-details`, `about`, `auth`
6. Адаптив: `profile`, `my-appointments`, `contacts`, `footer`

---

## Что НЕ входит в Фазу 9б

- Open Graph / Twitter Card теги
- Sitemap.xml / robots.txt
- Адаптив admin-панели и панели врача
- Canonical URLs
- Structured data (Schema.org)
