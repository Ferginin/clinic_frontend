import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DoctorsComponent } from './components/doctors/doctors.component';
import { DoctorDetailsComponent } from './components/doctor-details/doctor-details.component';
import { ServicesComponent } from './components/services/services.component';
import { ServicesDetailComponent } from './components/services-detail/services-detail.component';
import { AuthComponent } from './components/auth/auth.component';
import { AboutComponent } from './components/about/about.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AppointmentBookingComponent } from './components/appointment-booking/appointment-booking.component';
import { MyAppointmentsComponent } from './components/my-appointments/my-appointments.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminDashboardComponent } from './components/admin/dashboard/admin-dashboard.component';
import { AdminDoctorsComponent } from './components/admin/doctors/admin-doctors.component';
import { AdminServicesComponent } from './components/admin/services/admin-services.component';
import { AdminCallbacksComponent } from './components/admin/callbacks/admin-callbacks.component';
import { AdminUsersComponent } from './components/admin/users/admin-users.component';
import { AdminAppointmentsComponent } from './components/admin/appointments/admin-appointments.component';
import { DoctorPanelComponent } from './components/doctor-panel/doctor-panel.component';
import { DoctorScheduleComponent } from './components/doctor-panel/doctor-schedule/doctor-schedule.component';
import { PatientDetailComponent } from './components/doctor-panel/patient-detail/patient-detail.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { doctorGuard } from './guards/doctor.guard';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'services/:id', component: ServicesDetailComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'doctors/:id', component: DoctorDetailsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'auth', component: AuthComponent },

  // Protected routes (patient)
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'book-appointment', component: AppointmentBookingComponent, canActivate: [authGuard] },
  { path: 'my-appointments', component: MyAppointmentsComponent, canActivate: [authGuard] },

  // Admin panel
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'doctors', component: AdminDoctorsComponent },
      { path: 'services', component: AdminServicesComponent },
      { path: 'callbacks', component: AdminCallbacksComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'appointments', component: AdminAppointmentsComponent },
    ],
  },

  // Doctor panel
  {
    path: 'doctor-panel',
    component: DoctorPanelComponent,
    canActivate: [doctorGuard],
    children: [
      { path: '', redirectTo: 'schedule', pathMatch: 'full' },
      { path: 'schedule', component: DoctorScheduleComponent },
      { path: 'appointments/:id', component: PatientDetailComponent },
    ]
  },

  { path: '**', redirectTo: '' },
];
