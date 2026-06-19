import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
})
export class PatientDetailComponent implements OnInit {
  appointmentId: number | null = null;
  appointment: any = null;
  patient: any = null;
  loading = true;
  formError = '';
  submitting = false;

  resultsForm = {
    results: '',
    status: 'pending',
  };

  statuses = [
    { value: 'pending', label: 'Ожидает' },
    { value: 'confirmed', label: 'Подтверждена' },
    { value: 'completed', label: 'Завершена' },
    { value: 'canceled', label: 'Отменена' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.appointmentId = +params['id'];
      if (this.appointmentId) {
        this.loadAppointment();
      }
    });
  }

  loadAppointment(): void {
    this.loading = true;
    this.api.getDoctorAppointments().subscribe({
      next: (appointments) => {
        this.appointment = appointments.find((apt: any) => apt.id === this.appointmentId);
        if (!this.appointment) {
          this.toast.error('Запись не найдена');
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }

        this.resultsForm.status = this.appointment.status;
        if (this.appointment.results) {
          this.resultsForm.results = this.appointment.results;
        }

        this.loadPatient();
      },
      error: () => {
        this.toast.error('Ошибка загрузки записи');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadPatient(): void {
    if (!this.appointment) return;

    this.api.getUser(this.appointment.patient_id).subscribe({
      next: (user) => {
        this.patient = user;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Ошибка загрузки информации о пациенте');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  submitResults(): void {
    if (!this.appointmentId) return;
    if (!this.resultsForm.results.trim()) {
      this.formError = 'Заполните поле результатов';
      return;
    }

    this.submitting = true;
    this.formError = '';

    const payload = {
      results: this.resultsForm.results,
      status: this.resultsForm.status,
    };

    this.api.addAppointmentResult(this.appointmentId, payload).subscribe({
      next: () => {
        this.submitting = false;
        this.toast.success('Результаты сохранены');
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/doctor-panel/schedule']);
        }, 1500);
      },
      error: (e) => {
        this.submitting = false;
        this.toast.error(e?.error?.error || 'Ошибка сохранения');
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/doctor-panel/schedule']);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('ru-RU', {
      year: 'numeric', month: 'long', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Ожидает', confirmed: 'Подтверждена', completed: 'Завершена', canceled: 'Отменена',
    };
    return labels[status] || status;
  }
}
