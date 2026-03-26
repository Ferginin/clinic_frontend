# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Angular app
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install global dependencies for serving
RUN npm install -g @angular/cli@16

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4200

# Serve the app
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check"]
