import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.scss'],
})
export class MyAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  loading = true;
  cancellingId: number | null = null;

  constructor(private api: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef, private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.set('Мои записи — МЕДЛАЙФ', 'История и предстоящие приёмы в клинике МЕДЛАЙФ.');
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.api.getUserAppointments().subscribe({
      next: (data) => {
        this.appointments = (data || []).sort(
          (a: any, b: any) =>
            new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Не удалось загрузить записи. Попробуйте обновить страницу.');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  cancelAppointment(id: number): void {
    this.cancellingId = id;
    this.api.cancelAppointment(id).subscribe({
      next: () => {
        this.cancellingId = null;
        this.loadAppointments();
      },
      error: () => {
        this.toast.error('Не удалось отменить запись. Попробуйте ещё раз.');
        this.cancellingId = null;
        this.cdr.markForCheck();
      },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Ожидает',
      confirmed: 'Подтверждена',
      completed: 'Завершена',
      canceled: 'Отменена',
    };
    return map[status] ?? status;
  }

  canCancel(status: string): boolean {
    return status === 'pending' || status === 'confirmed';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString('ru-RU', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
