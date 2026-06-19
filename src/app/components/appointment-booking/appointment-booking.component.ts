import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { Router } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './appointment-booking.component.html',
  styleUrls: ['./appointment-booking.component.scss'],
})
export class AppointmentBookingComponent implements OnInit {
  currentStep = 1;

  doctors: any[] = [];
  loadingDoctors = true;
  selectedDoctor: any = null;

  selectedDate: string = '';
  minDate: string = '';
  maxDate: string = '';

  dateGrid: { date: string; dayName: string; dayNum: string; month: string; available: boolean }[] = [];

  slots: any[] = [];
  selectedSlot: any = null;
  slotsLoading = false;
  slotsError = '';

  notes = '';
  isSubmitting = false;

  dayNames = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  constructor(private api: ApiService, private toast: ToastService, private router: Router, private cdr: ChangeDetectorRef, private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.set('Запись к врачу — МЕДЛАЙФ', 'Запишитесь к врачу онлайн в клинике МЕДЛАЙФ.');
    const today = new Date();
    this.minDate = this.formatDate(today);
    const max = new Date();
    max.setDate(max.getDate() + 30);
    this.maxDate = this.formatDate(max);
    this.selectedDate = this.minDate;

    this.loadDoctors();
    this.cdr.markForCheck();
  }

  loadDoctors(): void {
    this.loadingDoctors = true;
    this.api.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data || [];
        this.loadingDoctors = false;

        const preselected = history.state?.doctor;
        if (preselected?.id) {
          const match = this.doctors.find((d) => d.id === preselected.id);
          this.selectDoctor(match ?? preselected);
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Не удалось загрузить список врачей. Попробуйте обновить страницу.');
        this.loadingDoctors = false;
        this.cdr.markForCheck();
      },
    });
  }

  selectDoctor(doctor: any): void {
    this.selectedDoctor = doctor;
    this.selectedSlot = null;
    this.slots = [];
    this.selectedDate = '';
    this.buildDateGrid();
    this.currentStep = 2;
  }

  private backendDayToJs(day: number): number {
    return day === 7 ? 0 : day;
  }

  buildDateGrid(): void {
    const workingJsDays = (this.selectedDoctor?.schedules ?? [])
      .map((s: any) => this.backendDayToJs(s.day));

    const ruDay = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const ruMonth = ['янв', 'фев', 'мар', 'апр', 'май', 'июн',
                     'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

    const today = new Date();
    this.dateGrid = [];

    for (let i = 0; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const jsDay = d.getDay();
      this.dateGrid.push({
        date: this.formatDate(d),
        dayName: ruDay[jsDay],
        dayNum: String(d.getDate()),
        month: ruMonth[d.getMonth()],
        available: workingJsDays.includes(jsDay),
      });
    }
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    this.loadSlots();
  }

  onDateChange(): void {
    if (this.selectedDate && this.selectedDoctor) {
      this.loadSlots();
    }
  }

  loadSlots(): void {
    if (!this.selectedDoctor || !this.selectedDate) return;

    this.slotsLoading = true;
    this.slotsError = '';
    this.selectedSlot = null;

    this.api.getAvailableSlots(this.selectedDoctor.id, this.selectedDate).subscribe({
      next: (data) => {
        this.slots = data?.slots || [];
        this.slotsLoading = false;
        if (this.slots.length === 0) {
          this.slotsError = 'Врач не работает в этот день или все слоты заняты';
        }
        this.currentStep = 3;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.slotsLoading = false;
        this.slotsError = err?.error?.error || 'Ошибка загрузки слотов';
        this.slots = [];
        this.cdr.markForCheck();
      },
    });
  }

  selectSlot(slot: any): void {
    if (!slot.available) return;
    this.selectedSlot = slot;
    this.currentStep = 4;
  }

  goToStep(step: number): void {
    if (step < this.currentStep) {
      this.currentStep = step;
      if (step <= 1) {
        this.selectedDoctor = null;
        this.selectedSlot = null;
        this.slots = [];
      }
      if (step <= 2) {
        this.selectedSlot = null;
      }
    }
  }

  submitBooking(): void {
    if (!this.selectedDoctor || !this.selectedSlot || !this.selectedDate) return;

    this.isSubmitting = true;

    const scheduledAt = `${this.selectedDate}T${this.selectedSlot.start_time}:00Z`;

    this.api.bookAppointment({
      doctor_id: this.selectedDoctor.id,
      scheduled_at: scheduledAt,
      notes: this.notes || undefined,
    }).subscribe({
      next: () => {
        this.router.navigate(['/my-appointments']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err?.error?.error || 'Ошибка при создании записи');
      },
    });
  }

  formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  formatDisplayDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['января','февраля','марта','апреля','мая','июня',
                    'июля','августа','сентября','октября','ноября','декабря'];
    const weekdays = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
    return `${d.getDate()} ${months[d.getMonth()]}, ${weekdays[d.getDay()]}`;
  }

  getSpecializations(doctor: any): string {
    return doctor?.specializations?.map((s: any) => s.name).join(', ') || '';
  }

  formatTime(time: string): string {
    return time ? time.slice(0, 5) : '';
  }

  getWorkDays(doctor: any): string {
    if (!doctor?.schedules?.length) return '';
    return doctor.schedules
      .map((s: any) => `${this.dayNames[s.day]} ${this.formatTime(s.time_from)}–${this.formatTime(s.time_to)}`)
      .join(' · ');
  }

  get availableSlotsCount(): number {
    return this.slots.filter((s) => s.available).length;
  }
}
