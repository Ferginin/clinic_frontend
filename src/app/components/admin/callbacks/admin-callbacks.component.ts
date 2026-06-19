import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-admin-callbacks',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './admin-callbacks.component.html',
  styleUrls: ['./admin-callbacks.component.scss'],
})
export class AdminCallbacksComponent implements OnInit {
  callbacks: any[] = [];
  filtered: any[] = [];
  loading = true;
  filterStatus = '';

  showModal = false;
  selected: any = null;
  newStatus = '';

  showBookingModal = false;
  bookingMode: 'patient' | 'guest' = 'guest';
  bookingLoading = false;
  bookingError = '';
  doctors: any[] = [];
  users: any[] = [];
  availableSlots: any[] = [];
  slotsLoading = false;

  bookingForm = {
    patientId: null as number | null,
    guestName: '',
    guestPhone: '',
    doctorId: null as number | null,
    date: '',
    slotTime: '',
    notes: '',
  };

  constructor(private api: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.api.adminGetCallbackRequests().subscribe({
      next: (d) => {
        this.callbacks = (d || []).sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
      ? this.callbacks.filter((c) => c.status === this.filterStatus)
      : [...this.callbacks];
  }

  openDetail(cb: any): void {
    this.selected = cb;
    this.newStatus = cb.status;
    this.showModal = true;
  }

  saveStatus(): void {
    if (!this.selected) return;
    this.api
      .adminUpdateCallbackRequest(this.selected.id, { status: this.newStatus })
      .subscribe({
        next: () => {
          this.showModal = false;
          this.toast.success('Статус обновлён');
          this.load();
        },
        error: (e) => this.toast.error(e?.error?.error || 'Ошибка'),
      });
  }

  delete(id: number): void {
    if (!confirm('Удалить обращение?')) return;
    this.api.adminDeleteCallbackRequest(id).subscribe({
      next: () => {
        this.toast.success('Обращение удалено');
        this.load();
      },
      error: (e) => this.toast.error(e?.error?.error || 'Ошибка'),
    });
  }

  // --- Booking modal ---

  openBookingModal(cb: any): void {
    this.bookingError = '';
    this.availableSlots = [];
    this.bookingMode = 'guest';
    this.bookingForm = {
      patientId: null,
      guestName: cb.name || '',
      guestPhone: cb.phone || '',
      doctorId: null,
      date: '',
      slotTime: '',
      notes: cb.message || '',
    };

    this.api.getDoctors().subscribe((d) => {
      this.doctors = d || [];
      this.cdr.markForCheck();
    });
    this.api.adminGetAllUsers().subscribe((u) => {
      this.users = (u || []).filter((usr: any) => usr.role_name === 'user');
      this.cdr.markForCheck();
    });

    this.showBookingModal = true;
    this.cdr.markForCheck();
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.bookingError = '';
  }

  onDoctorOrDateChange(): void {
    if (!this.bookingForm.doctorId || !this.bookingForm.date) {
      this.availableSlots = [];
      this.bookingForm.slotTime = '';
      return;
    }
    this.slotsLoading = true;
    this.api
      .getAvailableSlots(this.bookingForm.doctorId, this.bookingForm.date)
      .subscribe({
        next: (res) => {
          this.availableSlots = (res?.slots || []).filter((s: any) => s.available);
          this.bookingForm.slotTime = '';
          this.slotsLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.availableSlots = [];
          this.slotsLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  submitBooking(): void {
    this.bookingError = '';

    if (!this.bookingForm.doctorId) { this.bookingError = 'Выберите врача'; return; }
    if (!this.bookingForm.date || !this.bookingForm.slotTime) { this.bookingError = 'Выберите дату и время'; return; }
    if (this.bookingMode === 'patient' && !this.bookingForm.patientId) { this.bookingError = 'Выберите пациента'; return; }
    if (this.bookingMode === 'guest' && !this.bookingForm.guestName.trim()) { this.bookingError = 'Укажите имя гостя'; return; }

    const scheduledAt = `${this.bookingForm.date}T${this.bookingForm.slotTime}:00Z`;

    const payload: any = {
      doctor_id: this.bookingForm.doctorId,
      scheduled_at: scheduledAt,
    };
    if (this.bookingForm.notes.trim()) payload.notes = this.bookingForm.notes.trim();
    if (this.bookingMode === 'patient') {
      payload.patient_id = this.bookingForm.patientId;
    } else {
      payload.guest_name = this.bookingForm.guestName.trim();
      if (this.bookingForm.guestPhone.trim()) payload.guest_phone = this.bookingForm.guestPhone.trim();
    }

    this.bookingLoading = true;
    this.api.adminCreateAppointmentForPatient(payload).subscribe({
      next: () => {
        this.bookingLoading = false;
        this.showBookingModal = false;
        this.toast.success('Запись на приём создана');
        this.cdr.markForCheck();
      },
      error: (e) => {
        this.bookingLoading = false;
        this.bookingError = e?.error?.error || 'Ошибка создания записи';
        this.cdr.markForCheck();
      },
    });
  }

  // --- Helpers ---

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { new: 'Новое', in_progress: 'В работе', done: 'Завершено' };
    return m[s] || s;
  }

  statusBadge(s: string): string {
    const m: Record<string, string> = { new: 'badge-yellow', in_progress: 'badge-blue', done: 'badge-green' };
    return m[s] || 'badge-grey';
  }

  formatTime(time: string): string {
    return time ? time.slice(0, 5) : '';
  }

  todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
