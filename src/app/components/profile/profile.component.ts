import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  appointments: any[] = [];
  appointmentHistory: any[] = [];
  loading = true;
  activeTab: 'info' | 'current' | 'history' = 'info';

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUserProfile();
    // this.loadAppointments();
  }

  loadUserProfile(): void {
    this.api.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: () => {
        this.router.navigate(['/auth']);
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadAppointments(): void {
    this.api.getUserAppointments().subscribe({
      next: (data) => {
        const now = new Date();
        this.appointments = (data || []).filter((apt: any) => new Date(apt.date) > now);
        this.appointmentHistory = (data || []).filter((apt: any) => new Date(apt.date) <= now);
      },
      error: () => {
        this.appointments = [];
        this.appointmentHistory = [];
      },
    });
  }

  cancelAppointment(appointmentId: number): void {
    if (confirm('Вы уверены, что хотите отменить запись?')) {
      this.api.cancelAppointment(appointmentId).subscribe({
        next: () => {
          this.loadAppointments();
          alert('Запись отменена');
        },
        error: () => {
          alert('Ошибка при отмене записи');
        },
      });
    }
  }

  logout(): void {
    this.api.logout();
    this.router.navigate(['/']);
  }
}
