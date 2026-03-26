import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  authMode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  passwordConfirm = '';
  name = '';
  message = '';
  messageType: 'error' | 'success' = 'error';
  loading = false;

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  toggleMode(): void {
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
    this.message = '';
  }

  onSubmit(): void {
    this.message = '';
    this.loading = true;

    if (this.authMode === 'login') {
      if (!this.email || !this.password) {
        this.message = 'Заполните все поля';
        this.messageType = 'error';
        this.loading = false;
        return;
      }

      this.api.login({ email: this.email, password: this.password }).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token || '');
          localStorage.setItem('user', JSON.stringify(res.user || {}));
          this.api.setAuthenticated(true);
          this.message = 'Успешный вход!';
          this.messageType = 'success';
          this.router.navigate(['/profile']);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.message = err.error?.message || 'Ошибка входа. Проверьте данные.';
          this.messageType = 'error';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      if (!this.name || !this.email || !this.password || !this.passwordConfirm) {
        this.message = 'Заполните все поля';
        this.messageType = 'error';
        this.loading = false;
        return;
      }

      if (this.password !== this.passwordConfirm) {
        this.message = 'Пароли не совпадают';
        this.messageType = 'error';
        this.loading = false;
        return;
      }

      this.api.register({ username: this.name, email: this.email, password: this.password }).subscribe({
        next: (res: any) => {
          this.message = 'Регистрация успешна! Войдите в систему.';
          this.messageType = 'success';
          this.authMode = 'login';
          this.name = '';
          this.email = '';
          this.password = '';
          this.passwordConfirm = '';
          this.message = '';
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.message = err.error?.message || 'Ошибка регистрации';
          this.messageType = 'error';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
    }
  }
}
