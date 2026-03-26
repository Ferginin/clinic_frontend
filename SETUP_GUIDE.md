# Frontend Setup & Configuration Guide

## Prerequisites

- Node.js 18+ 
- npm 11.9.0 or higher
- Angular 21.0+

## Installation

### 1. Install Dependencies

```bash
cd Clinic_frontend
npm install
```

### 2. Environment Configuration

The API base URL is configured in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
};
```

Update this if your backend runs on a different URL/port.

### 3. Build Placeholder Assets

Create these placeholder images in `src/assets/`:

```
assets/
├── clinic-logo.png              # 50x50px clinic logo
├── placeholder-doctor.jpg       # 280x300px doctor placeholder
├── placeholder-service.jpg      # 250x180px service placeholder
├── placeholder-avatar.jpg       # 120x120px avatar placeholder
├── placeholder-about.jpg        # Gallery image placeholder
└── placeholder-license.jpg      # License image placeholder
```

Or update the image URLs in components if hosting elsewhere.

## Development Server

```bash
npm start
```

The application will be available at `http://localhost:4200`

## Build for Production

```bash
npm run build
```

Output will be in `dist/clinic-frontend/`

## Configuration by Branch

### Development
- API: `http://localhost:8080/api/v1`
- Port: 4200
- Enable: Angular DevTools, Debug logs

### Production
- API: `https://api.clinic.example.com/api/v1`
- Port: 443 (HTTPS)
- Optimizations: AOT, Tree-shaking, Minification

## Backend Integration Checklist

Before running frontend, ensure your backend implements these:

### 1. CORS Configuration
```
Allow Origin: http://localhost:4200 (dev), https://clinic.example.com (prod)
Allow Methods: GET, POST, PUT, DELETE, OPTIONS
Allow Headers: Content-Type, Authorization, X-Requested-With
```

### 2. Authentication Endpoints
- ✅ POST /auth/login - Returns { token, user }
- ✅ POST /auth/register - Accepts { name, email, password }
- ✅ Token format: JWT or Bearer token

### 3. Data Models Required

#### Doctor
```json
{
  "id": 1,
  "name": "Dr. John Doe",
  "specialization": "Cardiology",
  "description": "Experienced cardiologist...",
  "image": "url",
  "phone": "+7999...",
  "schedule": [
    { "day": "Monday", "time": "09:00-17:00" }
  ]
}
```

#### Service
```json
{
  "id": 1,
  "name": "Consultation",
  "category": "consultations",
  "description": "Professional consultation",
  "price": 1000,
  "image": "url"
}
```

#### User/Profile
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "password": "hashed_password",
  "birthDate": "1990-01-01",
  "phone": "+7999...",
  "avatar": "url"
}
```

#### Appointment
```json
{
  "id": 1,
  "userId": 1,
  "doctorId": 1,
  "doctorName": "Dr. John",
  "serviceName": "Consultation",
  "specialization": "Cardiology",
  "date": "2024-12-31T10:00:00",
  "room": "101",
  "notes": "Patient notes"
}
```

## API Response Format

All endpoints should return consistent JSON format:

### Success Response
```json
{
  "data": { ... },
  "message": "Success message",
  "status": 200
}
```

Or for authentication:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "name": "John", "email": "john@example.com" }
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "error_code",
  "status": 400
}
```

## Docker Deployment

See [DOCKER_SETUP.md](../DOCKER_SETUP.md) for containerization instructions.

## Features Requiring Backend Implementation

### 1. Online Booking
- Endpoint: POST /user/appointments
- Requires: User authentication, available time slots
- Returns: Confirmation with appointment ID

### 2. Callback Request
- Endpoint: POST /callback-request
- Accepts: { phone, name }
- Note: Can work without authentication

### 3. Service Categories
- Endpoint: GET /service-categories
- Returns: Array of { id, name }

### 4. Clinic Info/Gallery
- Endpoint: GET /clinic/info - Returns clinic description
- Endpoint: GET /clinic/gallery - Returns gallery images with descriptions
- Endpoint: GET /clinic/licenses - Returns license images

## Troubleshooting

### Port Already in Use
```bash
# Change port
ng serve --port 4300
```

### CORS Errors
- Check backend CORS configuration
- Verify correct API base URL in environment.ts
- Check browser console for exact error

### API 404 Errors
- Verify endpoint paths match backend implementation
- Check API base URL is correct
- Ensure backend is running

### Authentication Issues
- Verify token is stored in localStorage
- Check token format in API headers
- Ensure backend validates tokens correctly

## Performance Optimization

- Angular AOT compilation enabled by default
- Bundle size: ~1.2MB (pre-gzip)
- Lazy loading available for component routes
- Caching headers configured for static assets

## Security Considerations

✅ JWT token-based authentication
✅ HTTPS-ready (change apiBaseUrl to https:// in prod)
✅ XSS protection via Angular DomSanitizer
✅ CSRF protection via HttpClientXsrfModule (ready to enable)
✅ Secure token storage (localStorage)
⚠️ TODO: Implement refresh token mechanism
⚠️ TODO: Add rate limiting on frontend

## Useful Commands

```bash
# Development
npm start                    # Start dev server
npm run build               # Production build
npm run lint                # Lint check
npm test                    # Run tests
npm run watch               # Watch mode

# Docker
docker build -t clinic-frontend .
docker run -p 4200:80 clinic-frontend
```

## Support & Documentation

- Angular Documentation: https://angular.io/docs
- API Testing: Use Postman with collection from backend repo
- Component Development: See individual component README files

## Contact

For frontend issues, check the component's own documentation or review the main [README.md](../README.md)
