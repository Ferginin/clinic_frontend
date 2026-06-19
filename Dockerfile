# Stage 1: Build Angular app
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist/Clinic_frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
