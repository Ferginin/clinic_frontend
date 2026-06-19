import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  stats = { doctors: 0, users: 0, appointments: 0, callbacks: 0 };
  recentAppointments: any[] = [];
  recentCallbacks: any[] = [];
  loading = true;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    let completed = 0;
    const finishIfAll = () => { if (++completed === 4) { this.loading = false; this.cdr.markForCheck(); } };

    this.api.getDoctors().subscribe({
      next: (d) => { this.stats.doctors = d?.length || 0; finishIfAll(); },
      error: () => finishIfAll(),
    });

    this.api.adminGetAllUsers().subscribe({
      next: (u) => { this.stats.users = u?.length || 0; finishIfAll(); },
      error: () => finishIfAll(),
    });

    this.api.adminGetAllAppointments().subscribe({
      next: (a) => {
        this.stats.appointments = a?.length || 0;
        this.recentAppointments = (a || [])
          .sort((x: any, y: any) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())
          .slice(0, 7);
        finishIfAll();
      },
      error: () => finishIfAll(),
    });

    this.api.adminGetCallbackRequests().subscribe({
      next: (c) => {
        this.stats.callbacks = c?.length || 0;
        this.recentCallbacks = (c || [])
          .sort((x: any, y: any) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())
          .slice(0, 5);
        finishIfAll();
      },
      error: () => finishIfAll(),
    });
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      pending: 'Ожидает', confirmed: 'Подтверждена',
      completed: 'Завершена', canceled: 'Отменена',
    };
    return m[s] || s;
  }

  statusBadge(s: string): string {
    const m: Record<string, string> = {
      pending: 'badge-yellow', confirmed: 'badge-blue',
      completed: 'badge-green', canceled: 'badge-red',
    };
    return m[s] || 'badge-grey';
  }

  callbackStatusLabel(s: string): string {
    const m: Record<string, string> = { new: 'Новое', in_progress: 'В работе', done: 'Завершено' };
    return m[s] || s;
  }

  callbackStatusBadge(s: string): string {
    const m: Record<string, string> = { new: 'badge-yellow', in_progress: 'badge-blue', done: 'badge-green' };
    return m[s] || 'badge-grey';
  }
}
