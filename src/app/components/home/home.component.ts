import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isAuthenticated = false;
  carousel = [];
  services = [];
  doctors = [];
  clinicName = 'Клиника МедТех';
  clinicPhones = ['+7 (999) 123-45-67', '+7 (999) 123-45-68'];
  clinicInfo = '';
  clinicShortInfo = 'Профессиональная медицинская помощь с использованием современных технологий. Опытные врачи, комфортные условия, качественное обслуживание.';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    // Check authentication
    this.api.isAuthenticated$.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
    });
    this.isAuthenticated = !!localStorage.getItem('token');

    // Load data
    this.api.getCarousel().subscribe({
      next: (data) => (this.carousel = data || []),
      error: () => (this.carousel = []),
    });

    this.api.getServices().subscribe({
      next: (data) => (this.services = (data || []).slice(0, 6)),
      error: () => (this.services = []),
    });

    this.api.getDoctors().subscribe({
      next: (data) => (this.doctors = (data || []).slice(0, 6)),
      error: () => (this.doctors = []),
    });

    this.api.getClinicInfo().subscribe({
      next: (data) => (this.clinicInfo = data?.description || ''),
      error: () => (this.clinicInfo = ''),
    });
  }

  onlineBooking(): void {
    if (this.isAuthenticated) {
      // Will navigate to booking page (to be created)
      this.router.navigate(['/booking']);
    } else {
      this.router.navigate(['/auth']);
    }
  }

  requestCallback(): void {
    // Modal or form for callback request
    alert('Форма обратного звонка');
  }
}
