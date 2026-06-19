import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CallbackRequestComponent } from '../callback-request/callback-request.component';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CallbackRequestComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isAuthenticated = false;
  favoriteCategories: any[] = [];
  showCallbackModal = false;

  phones = ['+7 (3846) 652 652', '+7 (903) 067 78 88', '+7 (923) 473 78 88'];

  stats = [
    {
      value: '15',
      label: 'лет работы',
      text: '15 лет экспертной практики от основателей к новым поколениям врачей. Тысячи семей доверяют нам с 2009 года, знак наши стандарты заботы проверены временем.',
    },
    {
      value: '20',
      label: 'врачей',
      text: 'Мы сочетаем академические знания с практической мудростью. Ваше лечение в «МЕДЛАЙФ» соответствует мировым стандартам.',
    },
    {
      value: '20+',
      label: 'услуг',
      text: 'Полный цикл заботы от диагностики до лечения в одном месте.',
    },
  ];

  specialistBenefits = {
    left: ['Все специалисты в одной клинике', 'Технологичная диагностика', 'Комфорт и забота о пациенте'],
    right: ['Врачи экспертного уровня', 'Технологичная диагностика', 'Прозрачность ценообразования'],
  };

  diagnostics = [
    { id: '01', title: 'Ведущая диагностика', subtitle: 'Сертифицированные современные аппараты' },
    {
      id: '02',
      title: 'Маммограф',
      subtitle: 'Современный цифровой рентгеновский маммограф итальянской фирмы GIOTTO 3D.',
    },
    { id: '03', title: 'Гастроэнтерология экспертного уровня', subtitle: 'Интеграция с лабораторией и УЗИ-диагностикой' },
  ];

  activeDiagnostic = 1;

  // Callback form
  cbPhone = '';
  cbName = '';
  cbMessage = '';
  cbAgree = false;
  cbSubmitting = false;
  cbSuccess = false;

  constructor(private api: ApiService, private toast: ToastService, private router: Router, private cdr: ChangeDetectorRef, private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.set('МЕДЛАЙФ — Медицинский центр', 'Качественная медицинская помощь в Кемерово. Запись онлайн.');
    this.api.isAuthenticated$.subscribe((v) => (this.isAuthenticated = v));
    this.isAuthenticated = !!localStorage.getItem('token');

    this.api.getFavoriteCategories().subscribe({
      next: (data) => {
        const favorites = (data || []).slice(0, 4);
        if (favorites.length > 0) {
          this.favoriteCategories = favorites;
        } else {
          this.api.getCategories().subscribe({
            next: (cats) => (this.favoriteCategories = (cats || []).slice(0, 4)),
            error: () => (this.favoriteCategories = []),
          });
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.api.getCategories().subscribe({
          next: (data) => (this.favoriteCategories = (data || []).slice(0, 4)),
          error: () => (this.favoriteCategories = []),
        });
        this.cdr.markForCheck();
      },
    });
  }

  goToBooking(): void {
    this.router.navigate([this.isAuthenticated ? '/book-appointment' : '/auth']);
  }

  selectDiagnostic(index: number): void {
    this.activeDiagnostic = index;
  }

  getServiceIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (/кардио|сердц/.test(n)) return 'assets/heart.png';
    if (/пульмон|лёгоч|легоч/.test(n)) return 'assets/lungs.png';
    if (/педиатр|дет|акушер|гинеко/.test(n)) return 'assets/baby.png';
    if (/терап|диагност|хирург|стетоскоп/.test(n)) return 'assets/stethoscope.png';
    return 'assets/placeholder-service.png';
  }

  submitCallback(): void {
    if (!this.cbPhone || !this.cbName || !this.cbAgree) return;
    this.cbSubmitting = true;

    this.api.createCallbackRequest({ name: this.cbName, phone: this.cbPhone, message: this.cbMessage }).subscribe({
      next: () => {
        this.cbSuccess = true;
        this.cbSubmitting = false;
        this.cbPhone = '';
        this.cbName = '';
        this.cbMessage = '';
        this.cbAgree = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Ошибка. Попробуйте позже.');
        this.cbSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }
}