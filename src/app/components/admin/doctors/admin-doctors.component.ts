import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

interface DoctorForm {
  id?: number;
  fullname: string;
  description: string;
  doctor_photo: string;
  user_id: string;
  specialization_ids: number[];
}

interface ScheduleForm {
  id?: number;
  doctor_id?: number;
  day: number;
  time_from: string;
  time_to: string;
}

const DAYS = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './admin-doctors.component.html',
  styleUrls: ['./admin-doctors.component.scss'],
})
export class AdminDoctorsComponent implements OnInit {
  doctors: any[] = [];
  specializations: any[] = [];
  loading = true;

  showDoctorModal = false;
  isEditing = false;
  saving = false;
  form: DoctorForm = this.emptyForm();
  formError = '';

  showScheduleModal = false;
  scheduleDoctor: any = null;
  scheduleForm: ScheduleForm = this.emptySchedule();
  savingSchedule = false;
  editingScheduleId: number | null = null;

  days = DAYS;

  constructor(private api: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.getDoctors().subscribe({
      next: (d) => {
        this.doctors = d || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Ошибка загрузки');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
    this.api.getSpecializations().subscribe({
      next: (s) => { this.specializations = s || []; this.cdr.markForCheck(); },
      error: () => this.cdr.markForCheck(),
    });
  }

  emptyForm(): DoctorForm {
    return { fullname: '', description: '', doctor_photo: '', user_id: '', specialization_ids: [] };
  }

  emptySchedule(): ScheduleForm {
    return { day: 1, time_from: '09:00', time_to: '18:00' };
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.formError = '';
    this.isEditing = false;
    this.showDoctorModal = true;
  }

  openEdit(doctor: any): void {
    this.form = {
      id: doctor.id,
      fullname: doctor.fullname,
      description: doctor.description || '',
      doctor_photo: doctor.doctor_photo || '',
      user_id: doctor.user_id?.toString() || '',
      specialization_ids: (doctor.specializations || []).map((s: any) => s.id),
    };
    this.formError = '';
    this.isEditing = true;
    this.showDoctorModal = true;
  }

  closeModal(): void {
    this.showDoctorModal = false;
    this.formError = '';
  }

  toggleSpecialization(id: number): void {
    const idx = this.form.specialization_ids.indexOf(id);
    if (idx > -1) this.form.specialization_ids.splice(idx, 1);
    else this.form.specialization_ids.push(id);
  }

  isSpecSelected(id: number): boolean {
    return this.form.specialization_ids.includes(id);
  }

  saveDoctor(): void {
    if (!this.form.fullname.trim()) { this.formError = 'Введите ФИО'; return; }
    this.saving = true;
    this.formError = '';

    const payload: any = {
      fullname: this.form.fullname.trim(),
      specialization_ids: this.form.specialization_ids,
    };
    if (this.form.description) payload.description = this.form.description;
    if (this.form.doctor_photo) payload.doctor_photo = this.form.doctor_photo;
    if (this.form.user_id) payload.user_id = parseInt(this.form.user_id, 10);

    const req = this.isEditing
      ? this.api.adminUpdateDoctor(this.form.id!, payload)
      : this.api.adminCreateDoctor(payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.showDoctorModal = false;
        this.toast.success(this.isEditing ? 'Врач обновлён' : 'Врач добавлен');
        this.load();
      },
      error: (e) => {
        this.saving = false;
        this.formError = e?.error?.error || 'Ошибка сохранения';
      },
    });
  }

  deleteDoctor(id: number): void {
    if (!confirm('Удалить врача?')) return;
    this.api.adminDeleteDoctor(id).subscribe({
      next: () => { this.toast.success('Врач удалён'); this.load(); },
      error: (e) => this.toast.error(e?.error?.error || 'Ошибка удаления'),
    });
  }

  // ─── Schedule ───

  openSchedule(doctor: any): void {
    this.scheduleDoctor = doctor;
    this.scheduleForm = this.emptySchedule();
    this.editingScheduleId = null;
    this.showScheduleModal = true;
  }

  editSchedule(s: any): void {
    this.editingScheduleId = s.id;
    this.scheduleForm = { day: s.day, time_from: s.time_from?.slice(0, 5), time_to: s.time_to?.slice(0, 5) };
  }

  cancelEditSchedule(): void {
    this.editingScheduleId = null;
    this.scheduleForm = this.emptySchedule();
  }

  saveSchedule(): void {
    this.savingSchedule = true;
    const payload: any = {
      day: this.scheduleForm.day,
      time_from: this.scheduleForm.time_from,
      time_to: this.scheduleForm.time_to,
      doctor_id: this.scheduleDoctor.id,
    };

    const req = this.editingScheduleId
      ? this.api.adminUpdateSchedule(this.editingScheduleId, payload)
      : this.api.adminCreateSchedule(payload);

    req.subscribe({
      next: () => {
        this.savingSchedule = false;
        this.editingScheduleId = null;
        this.scheduleForm = this.emptySchedule();
        this.api.getDoctorSchedule(this.scheduleDoctor.id).subscribe({
          next: (s) => { this.scheduleDoctor = { ...this.scheduleDoctor, schedules: s }; this.load(); },
        });
      },
      error: (e) => { this.savingSchedule = false; this.toast.error(e?.error?.error || 'Ошибка'); },
    });
  }

  deleteSchedule(id: number): void {
    if (!confirm('Удалить расписание?')) return;
    this.api.adminDeleteSchedule(id).subscribe({
      next: () => {
        this.api.getDoctorSchedule(this.scheduleDoctor.id).subscribe({
          next: (s) => { this.scheduleDoctor = { ...this.scheduleDoctor, schedules: s }; this.load(); },
        });
      },
      error: (e) => this.toast.error(e?.error?.error || 'Ошибка удаления'),
    });
  }

  dayName(d: number): string { return DAYS[d] || d.toString(); }

  getSpecNames(doctor: any): string {
    return (doctor.specializations || []).map((s: any) => s.name).join(', ') || '—';
  }
}
