import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filtered: any[] = [];
  loading = true;
  search = '';

  constructor(private api: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
    this.cdr.markForCheck();
  }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.api.adminGetAllUsers().subscribe({
      next: (d) => {
        this.users = (d || []).sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        this.applySearch();
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

  applySearch(): void {
    const q = this.search.toLowerCase();
    this.filtered = q
      ? this.users.filter(
          (u) =>
            u.username?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q),
        )
      : [...this.users];
    this.cdr.markForCheck();
  }

  deleteUser(id: number): void {
    if (!confirm('Удалить пользователя? Это действие необратимо.')) return;
    this.api.adminDeleteUser(id).subscribe({
      next: () => { this.toast.success('Пользователь удалён'); this.load(); },
      error: (e) => this.toast.error(e?.error?.error || 'Ошибка удаления'),
    });
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  roleBadge(role: string): string {
    return role === 'admin' ? 'badge-red' : role === 'doctor' ? 'badge-blue' : 'badge-grey';
  }
}
