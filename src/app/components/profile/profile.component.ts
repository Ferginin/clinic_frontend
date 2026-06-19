import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  appointments: any[] = [];        // pending + confirmed
  appointmentHistory: any[] = [];  // completed + canceled
  loading = true;
  activeTab: 'info' | 'current' | 'history' = 'info';

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef, private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.set('Личный кабинет — МЕДЛАЙФ', 'Управление профилем и записями на приём.');
    this.loadUserProfile();
    this.loadAppointments();
  }

  loadUserProfile(): void {
    this.api.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.router.navigate(['/auth']);
      },
    });
  }

  loadAppointments(): void {
    this.api.getUserAppointments().subscribe({
      next: (data) => {
        const all = data || [];
        this.appointments = all.filter(
          (apt: any) => apt.status === 'pending' || apt.status === 'confirmed'
        );
        this.appointmentHistory = all.filter(
          (apt: any) => apt.status === 'completed' || apt.status === 'canceled'
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.appointments = [];
        this.appointmentHistory = [];
        this.cdr.markForCheck();
      },
    });
  }

  cancelAppointment(appointmentId: number): void {
    this.api.cancelAppointment(appointmentId).subscribe({
      next: () => this.loadAppointments(),
      error: () => {},
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString('ru-RU', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  logout(): void {
    this.api.logout();
    this.router.navigate(['/']);
  }
}
