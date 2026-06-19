# 🏥 Clinic Frontend - Angular 21

Modern, fully-responsive clinic management frontend with authentication, doctor management, services, and personal user cabinet.

## 📋 Overview

Complete redesign of clinic frontend with 8 main pages, beautiful color scheme, and smooth animations.

### 🎨 Color Scheme
- **Primary Green**: #68D391
- **Dark Green**: #276749  
- **Black**: #000000
- **White**: #FFFFFF
- **Grey**: #999999

### 📄 Pages Included
1. **Home** (`/`) - Hero section with services & doctors preview
2. **Services** (`/services`) - Filterable service grid
3. **Doctors** (`/doctors`) - Doctor listings with specializations
4. **Doctor Details** (`/doctors/:id`) - Full doctor profile
5. **About** (`/about`) - Clinic history & licenses
6. **Contacts** (`/contacts`) - Address, map, contact info
7. **Auth** (`/auth`) - Login/Registration with validation
8. **Personal Cabinet** (`/profile`) - User dashboard & medical history

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`

### Production Build
```bash
npm run build
```

## 🔧 Configuration

### API Base URL
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
};
```

## 📦 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── header/              # Navigation header
│   │   ├── footer/              # Footer with links
│   │   ├── home/                # Home page
│   │   ├── services/            # Services listing + filters
│   │   ├── doctors/             # Doctor grid
│   │   ├── doctor-details/      # Doctor detail view
│   │   ├── about/               # Clinic info & licenses
│   │   ├── contacts/            # Contact info + map
│   │   ├── auth/                # Login/Register
│   │   └── profile/             # User dashboard
│   ├── services/
│   │   └── api.service.ts       # API integration
│   ├── pipes/
│   │   └── safe.pipe.ts         # URL sanitization
│   └── app.routes.ts            # Route definitions
├── styles.scss                  # Global styles
└── environments/                # Environment config
```

## ✨ Key Features

✅ **Responsive Design** - Works on all devices
✅ **Modern UI** - Beautiful gradients & animations
✅ **Authentication** - Secure login/registration with JWT
✅ **Protected Routes** - Personal cabinet requires login
✅ **Form Validation** - Real-time validation feedback
✅ **API Integration** - Complete service layer
✅ **Service Filtering** - Filter by category
✅ **Doctor Profiles** - Detailed specialist information
✅ **Appointment Management** - Book & cancel appointments
✅ **Responsive Maps** - Embedded Google Maps

## 🔐 Authentication

- JWT token-based
- Token stored in `localStorage`
- Auto-redirect on login success
- Protected routes with auth guards
- Logout functionality in header

## 📱 Responsive Breakpoints

- **Desktop**: Full layout with all features
- **Tablet** (768px): Optimized for touch
- **Mobile** (<568px): Single column, simplified layout

## 🌐 API Integration

The frontend is configured to work with these endpoints:

```
GET    /doctors          # All doctors
GET    /doctors/:id      # Doctor details
GET    /services         # All services
GET    /services?category=:cat  # Filter services
POST   /auth/login       # User login
POST   /auth/register    # User registration
GET    /user/profile     # User info
POST   /user/appointments   # Book appointment
GET    /user/appointments   # User appointments
DELETE /user/appointments/:id # Cancel appointment
POST   /callback-request    # Request callback
```

## 🛠 Technologies Used

- **Framework**: Angular 21
- **Language**: TypeScript
- **Styling**: SCSS with variables
- **HTTP**: HttpClientModule
- **Routing**: Angular Router
- **Forms**: FormsModule with validation
- **Build**: Angular CLI

## 📋 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🎯 Development Commands

```bash
npm start              # Dev server (port 4200)
npm run build          # Production build
npm run lint           # Lint check
npm test               # Run tests
npm run watch          # Watch mode
```

## 🐳 Docker

Build and run with Docker:
```bash
docker build -t clinic-frontend .
docker run -p 4200:80 clinic-frontend
```

See [DOCKER_SETUP.md](../DOCKER_SETUP.md) for detailed instructions.
