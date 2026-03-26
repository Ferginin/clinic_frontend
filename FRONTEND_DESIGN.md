# Clinic Frontend - New Design

## Project Overview

This is a completely redesigned Angular clinic frontend with modern UI/UX, featuring 6 main pages with authentication, doctor management, services, and a user personal cabinet.

## Color Scheme

- **Primary Green**: `#68D391`
- **Dark Green**: `#276749`
- **Black**: `#000000`
- **White**: `#FFFFFF`
- **Grey**: `#999999`
- **Light Grey**: `#f5f5f5`

## Pages Structure

### 1. **Home Page** (`/`)
- **Header**: 
  - Left: Clinic logo/icon
  - Center: Navigation (Services, Doctors, About)
  - Right: Contacts, Login/Register (or Personal Cabinet if authenticated)

- **Hero Section**:
  - Clinic name displayed prominently in center
  - Phone numbers on left, Online booking & Callback buttons on right
  
- **Clinic Info Panel**: Brief information about the clinic

- **Popular Services**: Display 6 popular services with "View All" button

- **Our Specialists**: Display 6 doctors with "View All" button

- **Footer**: Address (left), Navigation links (center), Email & Contacts (right)

### 2. **Services Page** (`/services`)
- Page title with gradient background
- **Filter buttons**: All | Consultations | Diagnostics | Rehabilitation
- **Services grid**: Cards with service image, name, price
- Click on card to view service details
- Sticky filter on scroll

### 3. **Doctors Page** (`/doctors`)
- Large centered title "СПЕЦИАЛИСТЫ" (Specialists)
- **Doctor card grid**:
  - Doctor photo
  - Full name
  - Specialization
  - Hover effects with smooth animation
- Click on card to view doctor details

### 4. **Doctor Details Page** (`/doctors/:id`)
- Back button to doctors list
- Large doctor photo on left
- Right side: Full name, specialization badge, description, contact info, schedule
- "Book Appointment" button (links to booking form)

### 5. **About Page** (`/about`)
- Page title with gradient background
- Gallery section: Clinic history with photos and descriptions
- Licenses section: Display all clinic licenses with images

### 6. **Contacts Page** (`/contacts`)
- Page title with gradient background
- Two-column layout:
  - Left: Address, phone numbers, email, working hours
  - Right: Embedded Google Map
- All contact info is clickable (phone, email)

### 7. **Auth Page** (`/auth`)
- Toggle between Login and Registration modes
- Responsive form with validation
- Success/Error messages
- After successful login, redirects to /profile
- Secure token storage in localStorage

### 8. **Personal Cabinet** (`/profile`) - Protected
- User info section: Full name, birth date, email
- Three tabs:
  1. **Personal Information**: User profile details
  2. **Current Appointments**: Active medical card with current bookings
  3. **Service History**: Past appointments and services used
- Logout button in header
- Redirect to /auth if not authenticated

## Component Structure

```
src/app/
├── components/
│   ├── header/              # Main navigation header
│   ├── footer/              # Footer with contacts
│   ├── home/                # Home page
│   ├── services/            # Services listing with filters
│   ├── service-details/     # (Optional) Single service details
│   ├── doctors/             # Doctors listing
│   ├── doctor-details/      # Doctor details page
│   ├── about/               # Clinic history & licenses
│   ├── contacts/            # Contact info & map
│   ├── auth/                # Login/Registration
│   └── profile/             # Personal cabinet
├── services/
│   └── api.service.ts       # HTTP API calls
├── pipes/
│   └── safe.pipe.ts        # Safe URL pipe for maps
├── app.routes.ts            # Route definitions
├── app.component.ts         # Root component
└── styles.scss              # Global styles
```

## API Endpoints Integration

The API service is configured to work with the following endpoints:

```
Base URL: http://localhost:8080/api/v1/

Endpoints:
- GET    /doctors                    # Get all doctors
- GET    /doctors/:id               # Get doctor details
- GET    /services                  # Get all services
- GET    /services?category=:cat    # Filter services
- GET    /service-categories        # Get service categories
- GET    /carousel                  # Get home carousel
- GET    /clinic/info               # Clinic information
- GET    /clinic/licenses           # Clinic licenses
- GET    /clinic/gallery            # Clinic gallery/history
- POST   /auth/login                # User login
- POST   /auth/register             # User registration
- GET    /user/profile              # Get user profile (auth required)
- PUT    /user/profile              # Update profile (auth required)
- GET    /user/appointments         # Get user appointments (auth required)
- POST   /user/appointments         # Book appointment (auth required)
- DELETE /user/appointments/:id     # Cancel appointment (auth required)
- POST   /callback-request          # Request callback
```

## Authentication

- **Token Storage**: `localStorage.getItem('token')`
- **User Info Storage**: `localStorage.getItem('user')`
- **Auth State**: Observable in `ApiService.isAuthenticated$`
- **Protected Routes**: Profile component checks authentication on init
- **Header Updates**: Header component subscribes to auth state changes

## Key Features

✅ Responsive Design (Mobile, Tablet, Desktop)
✅ Modern Color Scheme with Gradients
✅ Smooth Animations and Hover Effects
✅ Form Validation & Error Handling
✅ Authentication System
✅ Filter/Search Functionality
✅ Google Maps Integration
✅ Sticky Navigation
✅ Accessibility Features
✅ SEO-Friendly Structure

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Update API base URL in `src/environments/environment.ts` if needed

3. Run development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

## Development Notes

- All components are **standalone** (Angular 14+)
- Uses **reactive styling** with SCSS variables
- **Mobile-first** approach in CSS media queries
- **Token-based authentication** with JWT
- **HttpClient** for API communication
- **Routing** with lazy loading support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Service detail pages
- [ ] Appointment booking modal
- [ ] Callback form modal
- [ ] Doctor ratings/reviews
- [ ] Testimonials carousel
- [ ] FAQ section
- [ ] Blog/News section
- [ ] Service packages
- [ ] Online consultation feature
- [ ] Payment integration
