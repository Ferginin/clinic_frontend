import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DoctorsComponent } from './components/doctors/doctors.component';
import { DoctorDetailsComponent } from './components/doctor-details/doctor-details.component';
import { ServicesComponent } from './components/services/services.component';
import { AuthComponent } from './components/auth/auth.component';
import { AboutComponent } from './components/about/about.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { ProfileComponent } from './components/profile/profile.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'doctors/:id', component: DoctorDetailsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' },
];
