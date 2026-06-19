import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './doctor-schedule.component.html',
  styleUrls: ['./doctor-schedule.component.scss'],
})
export class DoctorScheduleComponent implements OnInit {
  currentWeekStart: Date = new Date();
  appointments: any[] = [];
  weekDays: any[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.setWeekStart();
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  setWeekStart(): void {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    this.currentWeekStart = new Date(today.setDate(diff));
    this.currentWeekStart.setHours(0, 0, 0, 0);
  }

  loadAppointments(): void {
    this.loading = true;
    this.api.getDoctorAppointments().subscribe({
      next: (data) => {
        this.appointments = data || [];
        this.buildWeekDays();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Ошибка загрузки расписания');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  buildWeekDays(): void {
    this.weekDays = [];
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);

      const dayAppointments = this.appointments.filter((apt) => {
        const aptDate = new Date(apt.scheduled_at);
        return (
          aptDate.toDateString() === date.toDateString() &&
          apt.status !== 'canceled'
        );
      });

      this.weekDays.push({
        date: date,
        dayName: dayNames[i],
        dateStr: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        appointments: dayAppointments,
      });
    }
  }

  previousWeek(): void {
    this.currentWeekStart = new Date(this.currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.buildWeekDays();
  }

  nextWeek(): void {
    this.currentWeekStart = new Date(this.currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.buildWeekDays();
  }

  goToAppointment(appointmentId: number): void {
    this.router.navigate(['/doctor-panel/appointments', appointmentId]);
  }

  statusBadge(status: string): string {
    const badges: Record<string, string> = {
      pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', canceled: 'badge-red',
    };
    return badges[status] || 'badge-grey';
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Ожидает', confirmed: 'Подтверждена', completed: 'Завершена', canceled: 'Отменена',
    };
    return labels[status] || status;
  }

  appointmentTime(date: string): string {
    return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
}
