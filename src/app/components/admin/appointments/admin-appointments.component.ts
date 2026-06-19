import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.scss'],
})
export class AdminAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  filtered: any[] = [];
  loading = true;
  filterStatus = '';

  showModal = false;
  selected: any = null;
  newStatus = '';

  statuses = [
    { value: 'pending', label: 'Ожидает' },
    { value: 'confirmed', label: 'Подтверждена' },
    { value: 'completed', label: 'Завершена' },
    { value: 'canceled', label: 'Отменена' },
  ];

  constructor(private api: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
    this.cdr.markForCheck();
  }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.api.adminGetAllAppointments().subscribe({
      next: (d) => {
        this.appointments = (d || []).sort((a: any, b: any) =>
          new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
        );
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Ошибка загрузки');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  applyFilter(): void {
    this.filtered = this.filterStatus
      ? this.appointments.filter((a) => a.status === this.filterStatus)
      : [...this.appointments];
  }

  openEdit(apt: any): void {
    this.selected = apt;
    this.newStatus = apt.status;
    this.showModal = true;
  }

  saveStatus(): void {
    if (!this.selected) return;
    this.api.adminUpdateAppointment(this.selected.id, { status: this.newStatus }).subscribe({
      next: () => {
        this.showModal = false;
        this.toast.success('Статус обновлён');
        this.load();
        this.cdr.markForCheck();
      },
      error: (e) => {
        this.toast.error(e?.error?.error || 'Ошибка обновления');
        this.cdr.markForCheck();
      },
    });
  }

  cancel(id: number): void {
    if (!confirm('Отменить запись?')) return;
    this.api.cancelAppointment(id).subscribe({
      next: () => { this.toast.success('Запись отменена'); this.load(); },
      error: (e) => this.toast.error(e?.error?.error || 'Ошибка'),
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
      pending: 'Ожидает', confirmed: 'Подтверждена', completed: 'Завершена', canceled: 'Отменена',
    };
    return m[s] || s;
  }

  statusBadge(s: string): string {
    const m: Record<string, string> = {
      pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', canceled: 'badge-red',
    };
    return m[s] || 'badge-grey';
  }
}
