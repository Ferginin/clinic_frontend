import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './doctor-details.component.html',
  styleUrls: ['./doctor-details.component.scss'],
})
export class DoctorDetailsComponent implements OnInit {
  doctor: any = null;
  loading = true;

  private readonly dayNames = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.toast.error('Некорректный ID врача.');
      this.loading = false;
      return;
    }

    this.api.getDoctor(id).subscribe({
      next: (data) => {
        this.doctor = data;
        const spec = data?.specializations?.map((s: any) => s.name).join(', ') || 'специалист';
        this.seo.set(
          `${data.fullname} — МЕДЛАЙФ`,
          `Врач ${spec} в клинике МЕДЛАЙФ. Запись онлайн.`
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Не удалось получить данные врача');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  dayName(day: number): string {
    return this.dayNames[day] ?? String(day);
  }

  formatTime(time: string): string {
    return time ? time.slice(0, 5) : '';
  }

  goToBooking(): void {
    this.router.navigate(['/book-appointment'], { state: { doctor: this.doctor } });
  }
}
