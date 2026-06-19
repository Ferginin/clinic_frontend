# Phase 10 — Deploy (Docker Compose + Nginx)

## Overview

Привести docker-инфраструктуру проекта к рабочему состоянию: один `docker compose up` поднимает весь стек. Nginx раздаёт скомпилированный Angular-фронт и проксирует `/api/` на Go-бэкенд. Никакого CI/CD — только локальный запуск.

**Стек:** Docker Compose, nginx:alpine, golang:1.25-alpine, node:22-alpine, postgres:17-alpine

**Область:** `Clinic_backend/docker-compose.yml`, `Clinic_backend/Dockerfile`, `Clinic_frontend/Dockerfile`, новый `Clinic_frontend/nginx.conf`, обновление `Clinic_backend/.env.example`

---

## Архитектура

```
Host: http://localhost
         │
    [port 80]
         │
   ┌─────▼──────┐
   │  frontend  │  nginx:alpine
   │  container │  ← dist/ Angular (try_files → SPA)
   │            │  ← /api/* → proxy backend:8000
   └─────┬──────┘
         │ medlife-network
   ┌─────▼──────┐     ┌──────────────┐
   │  backend   │────►│  postgres    │
   │  :8000     │     │  :5432       │
   └────────────┘     └──────────────┘
```

Хосту открыт только порт **80** (frontend/nginx). Порт 8000 бэкенда — только внутри docker-сети. Порт 5432 postgres — открыт на хосте для удобства разработки.

---

## Секция 1 — `Clinic_frontend/nginx.conf` (новый файл)

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

- `try_files $uri $uri/ /index.html` — корректная работа Angular Router (SPA fallback)
- `/api/` проксируется на backend по имени сервиса в docker-сети

---

## Секция 2 — `Clinic_frontend/Dockerfile` (переписать)

Двухстадийная сборка:
- **Stage 1 `builder`**: Node 22-alpine, `npm ci`, `npm run build -- --configuration production`
- **Stage 2**: nginx:alpine, копирует `dist/Clinic_frontend/browser/` → `/usr/share/nginx/html`, копирует `nginx.conf` → `/etc/nginx/conf.d/default.conf`

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=builder /app/dist/Clinic_frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

Убирается `ng serve`, `@angular/cli` в продакшн-стадии, порт 4200.

---

## Секция 3 — `Clinic_backend/Dockerfile` (двухстадийная сборка)

Текущий образ тянет весь Go-тулчейн в продакшн. Двухстадийная сборка уменьшает образ с ~500MB до ~20MB:

```dockerfile
FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY . .
RUN go build -o main ./cmd/app

FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/main .

CMD ["./main"]
```

- `ca-certificates` — нужен для HTTPS-запросов из Go (SMTP)
- `tzdata` — корректные временные зоны

---

## Секция 4 — `Clinic_backend/docker-compose.yml` (обновить)

Ключевые изменения:
1. `backend`: убрать секцию `ports:` (только в docker-сети), добавить `env_file: .env`, добавить `depends_on` с healthcheck
2. `frontend`: порт изменить с `4200:4200` на `80:80`, убрать лишний `environment:`
3. `postgres`: добавить `healthcheck`
4. Убрать все захардкоженные `environment:` из backend

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

## Секция 5 — `Clinic_backend/.env` и `.env.example` (обновить)

Добавить переменную `ALLOWED_ORIGINS`:

```env
# Database
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

# CORS — nginx теперь на порту 80
ALLOWED_ORIGINS=http://localhost

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=clinic@example.com
```

---

## Что НЕ входит в Фазу 10

- CI/CD (GitHub Actions и аналоги)
- SSL/HTTPS (Let's Encrypt, certbot)
- Деплой на реальный сервер
- Rate limiting на уровне Nginx
- Gzip-сжатие и кэширование статики в Nginx

---

## Порядок реализации

1. Создать `Clinic_frontend/nginx.conf`
2. Переписать `Clinic_frontend/Dockerfile`
3. Переписать `Clinic_backend/Dockerfile`
4. Обновить `Clinic_backend/docker-compose.yml`
5. Обновить `Clinic_backend/.env.example` (и `.env` если есть)
