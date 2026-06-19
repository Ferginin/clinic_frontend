# Phase 10 — Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Привести Docker-инфраструктуру к рабочему состоянию — `docker compose up --build` поднимает весь стек (Nginx + Angular + Go + PostgreSQL).

**Architecture:** Nginx-контейнер (порт 80) раздаёт скомпилированный Angular-фронт и проксирует `/api/` на Go-бэкенд внутри docker-сети. Бэкенд и postgres не экспонируются наружу напрямую. Секреты берутся из `Clinic_backend/.env` через `env_file`.

**Tech Stack:** Docker Compose 3.8, nginx:alpine, golang:1.25-alpine, node:22-alpine, postgres:17-alpine

---

## File Map

| Файл | Действие | Ответственность |
|---|---|---|
| `Clinic_frontend/nginx.conf` | Создать | SPA fallback + /api/ reverse proxy |
| `Clinic_frontend/Dockerfile` | Переписать | Multi-stage: Node build → nginx serve |
| `Clinic_backend/Dockerfile` | Переписать | Multi-stage: Go build → alpine run |
| `Clinic_backend/docker-compose.yml` | Обновить | Nginx port 80, env_file, healthcheck |
| `Clinic_backend/.env` | Обновить | Docker-совместимые значения |
| `Clinic_backend/.env.example` | Обновить | Актуальный шаблон |

---

### Task 1: Создать `Clinic_frontend/nginx.conf`

**Files:**
- Create: `Clinic_frontend/nginx.conf`

- [ ] **Step 1: Создать файл**

```nginx
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Пояснения:
- `try_files $uri $uri/ /index.html` — SPA fallback: любой неизвестный путь (например, `/doctors/5`) отдаёт `index.html`, Angular Router обрабатывает его сам.
- `proxy_pass http://backend:8000/api/` — `backend` это имя сервиса в docker-compose, разрешается через внутренний DNS docker-сети.

- [ ] **Step 2: Проверить синтаксис**

Если есть nginx локально:
```bash
nginx -t -c $(pwd)/Clinic_frontend/nginx.conf
```
Если нет — файл проверится при сборке образа на следующем шаге.

---

### Task 2: Переписать `Clinic_frontend/Dockerfile`

**Files:**
- Modify: `Clinic_frontend/Dockerfile`

**Контекст:** Текущий Dockerfile использует `ng serve` (dev-сервер) в продакшн-стадии — это неверно. Angular 21 с builder `@angular/build:application` выкладывает файлы в `dist/Clinic_frontend/browser/` (не в `dist/Clinic_frontend/`).

- [ ] **Step 1: Полностью заменить содержимое Dockerfile**

```dockerfile
# Stage 1: Build Angular app
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist/Clinic_frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

- [ ] **Step 2: Проверить путь к dist**

Angular 21 с `@angular/build:application` (подтверждено в `angular.json`) кладёт файлы в `dist/Clinic_frontend/browser/`. Если сборка упадёт с "directory not found", проверь реальный путь:

```bash
# В контейнере builder-стадии или локально после npm run build:
ls dist/Clinic_frontend/
# Должно быть: browser/  (и возможно server/)
# Если нет папки browser — замени путь на dist/Clinic_frontend/
```

---

### Task 3: Переписать `Clinic_backend/Dockerfile`

**Files:**
- Modify: `Clinic_backend/Dockerfile`

**Контекст:** Текущий образ тянет весь Go-тулчейн (~500MB) в финальный образ. Multi-stage сборка уменьшит его до ~20MB. `ca-certificates` нужен для HTTPS из Go (SMTP). `tzdata` — для корректных временных зон в логах.

- [ ] **Step 1: Полностью заменить содержимое Dockerfile**

```dockerfile
# Stage 1: Build Go binary
FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY . .
RUN go build -o main ./cmd/app

# Stage 2: Minimal runtime image
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/main .

CMD ["./main"]
```

---

### Task 4: Обновить `Clinic_backend/docker-compose.yml`

**Files:**
- Modify: `Clinic_backend/docker-compose.yml`

**Контекст:** Нужно:
1. Убрать `ports:` у backend (только внутренняя сеть)
2. Заменить `environment:` у backend на `env_file: .env`
3. Изменить порт frontend с 4200 на 80
4. Добавить `healthcheck` для postgres и `depends_on: condition: service_healthy` у backend

- [ ] **Step 1: Полностью заменить содержимое файла**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: Medlife_backend
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - medlife-network
    restart: unless-stopped

  frontend:
    build:
      context: ../Clinic_frontend
      dockerfile: Dockerfile
    container_name: Medlife_frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - medlife-network
    restart: unless-stopped

  postgres:
    image: postgres:17-alpine
    container_name: medlife_DB
    environment:
      - POSTGRES_DB=medlife_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./internal/storage/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - medlife-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d medlife_db"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

networks:
  medlife-network:
    driver: bridge
```

---

### Task 5: Обновить `Clinic_backend/.env` и `.env.example`

**Files:**
- Modify: `Clinic_backend/.env`
- Modify: `Clinic_backend/.env.example`

**Контекст:** Текущий `.env` содержит локальные значения (`DB_HOST=localhost`, `API_PORT=8080`, `IP_ADDRESS=localhost`). Для docker-compose нужны другие значения. `ALLOWED_ORIGINS` должен указывать на `http://localhost` (nginx теперь на порту 80, а не 4200).

- [ ] **Step 1: Полностью заменить `Clinic_backend/.env`**

```env
# Database — имена сервисов из docker-compose
DB_HOST=postgres
DB_PORT=5432
DB_NAME=medlife_db
DB_USERNAME=postgres
DB_PASSWORD=postgres

# API
IP_ADDRESS=0.0.0.0
API_PORT=8000

# JWT
JWT_SECRET=change_this_secret_in_production
JWT_EXPIRE_HOURS=24
JWT_REFRESH_EXPIRE_HOURS=168

# Environment
ENVIRONMENT=development

# CORS — nginx слушает на порту 80
ALLOWED_ORIGINS=http://localhost

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=clinic@example.com
```

- [ ] **Step 2: Полностью заменить `Clinic_backend/.env.example`**

```env
# Medlife Backend Environment Variables
# Copy this file to .env and fill in your values

# Database — для docker-compose используй имя сервиса "postgres"
DB_HOST=postgres
DB_PORT=5432
DB_NAME=medlife_db
DB_USERNAME=postgres
DB_PASSWORD=postgres

# API
IP_ADDRESS=0.0.0.0
API_PORT=8000

# JWT — обязательно смени секрет в продакшне
JWT_SECRET=change_this_secret_in_production
JWT_EXPIRE_HOURS=24
JWT_REFRESH_EXPIRE_HOURS=168

# Environment
ENVIRONMENT=development

# CORS — при запуске через docker-compose + nginx: http://localhost
# При локальной разработке без docker: http://localhost:4200
ALLOWED_ORIGINS=http://localhost

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=clinic@example.com
```

---

### Task 6: Проверить и запустить

**Files:** нет изменений — только верификация

- [ ] **Step 1: Перейти в директорию с docker-compose**

```bash
cd Clinic_backend
```

- [ ] **Step 2: Собрать все образы**

```bash
docker compose build
```

Ожидаемый вывод: все три сервиса успешно собираются без ошибок. Frontend-сборка займёт 2-5 минут (npm install + Angular build).

- [ ] **Step 3: Запустить стек**

```bash
docker compose up
```

Ожидаемый порядок запуска:
1. `medlife_DB` стартует, healthcheck проходит
2. `Medlife_backend` стартует, подключается к postgres
3. `Medlife_frontend` (nginx) стартует

- [ ] **Step 4: Проверить frontend**

Открыть в браузере: `http://localhost`

Ожидается: главная страница клиники МЕДЛАЙФ загружается без ошибок.

- [ ] **Step 5: Проверить API через nginx**

```bash
curl http://localhost/api/v1/doctors
```

Ожидается: JSON-ответ со списком врачей (или `{"success":false,...}` если БД пуста — главное не 502/404).

- [ ] **Step 6: Проверить SPA routing**

Открыть в браузере: `http://localhost/doctors`

Ожидается: страница врачей загружается (не 404 от nginx). Это подтверждает что `try_files` работает правильно.

- [ ] **Step 7: Остановить стек**

```bash
docker compose down
```

---

## Self-Review

**Spec coverage:**
- [x] `Clinic_frontend/nginx.conf` — Task 1
- [x] `Clinic_frontend/Dockerfile` переписан (nginx вместо ng serve) — Task 2
- [x] `Clinic_backend/Dockerfile` двухстадийная сборка — Task 3
- [x] `docker-compose.yml` — nginx на 80, env_file, healthcheck — Task 4
- [x] `.env` и `.env.example` обновлены — Task 5
- [x] Верификация запуском — Task 6

**Placeholder scan:** чисто — нет TBD, TODO, placeholder-кода.

**Type consistency:** файловые пути согласованы:
- `nginx.conf` → `COPY nginx.conf /etc/nginx/conf.d/default.conf` (Task 1 + Task 2)
- `dist/Clinic_frontend/browser` → путь в Dockerfile совпадает с выходом `@angular/build:application` (Task 2)
- `backend:8000` в nginx.conf → сервис `backend` на порту 8000 в docker-compose (Task 1 + Task 4)
- `env_file: .env` → файл `.env` обновлён в Task 5
