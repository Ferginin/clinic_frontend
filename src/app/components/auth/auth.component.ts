import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  authMode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  passwordConfirm = '';
  name = '';
  loading = false;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.set('Вход — МЕДЛАЙФ', 'Войдите в личный кабинет пациента клиники МЕДЛАЙФ.');
  }

  toggleMode(): void {
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
  }

  onSubmit(): void {
    this.loading = true;

    if (this.authMode === 'login') {
      if (!this.email || !this.password) {
        this.toast.error('Заполните все поля');
        this.loading = false;
        return;
      }

      this.api.login({ email: this.email, password: this.password }).subscribe({
        next: (res: any) => {
          const token = res.data?.token || res.token || '';
          const refreshToken = res.data?.refresh_token || res.refresh_token || '';
          const user = res.data?.user || res.user || {};
          localStorage.setItem('token', token);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          this.api.setAuthenticated(true);
          this.loading = false;
          this.router.navigate(['/profile']);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toast.error(err.error?.error || err.error?.message || 'Ошибка входа. Проверьте данные.');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      if (!this.name || !this.email || !this.password || !this.passwordConfirm) {
        this.toast.error('Заполните все поля');
        this.loading = false;
        return;
      }

      if (this.password !== this.passwordConfirm) {
        this.toast.error('Пароли не совпадают');
        this.loading = false;
        return;
      }

      this.api.register({ username: this.name, email: this.email, password: this.password }).subscribe({
        next: () => {
          this.authMode = 'login';
          this.name = '';
          this.email = '';
          this.password = '';
          this.passwordConfirm = '';
          this.toast.success('Регистрация успешна! Войдите в систему.');
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Ошибка регистрации');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
    }
  }
}
