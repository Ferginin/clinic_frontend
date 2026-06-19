import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './admin-services.component.html',
  styleUrls: ['./admin-services.component.scss'],
})
export class AdminServicesComponent implements OnInit {
  activeTab: 'services' | 'categories' | 'specializations' = 'services';

  services: any[] = [];
  categories: any[] = [];
  specializations: any[] = [];
  loading = true;

  showServiceModal = false;
  editingServiceId: number | null = null;
  serviceForm: any = this.emptyService();
  savingService = false;
  serviceError = '';

  showCategoryModal = false;
  editingCategoryId: number | null = null;
  categoryForm: any = this.emptyCategory();
  savingCategory = false;
  categoryError = '';

  showSpecModal = false;
  editingSpecId: number | null = null;
  specForm: any = { name: '', description: '' };
  savingSpec = false;
  specError = '';

  constructor(private api: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    let completed = 0;
    const finishIfAll = () => { if (++completed === 3) { this.loading = false; this.cdr.markForCheck(); } };

    this.api.getServices().subscribe({
      next: (s) => { this.services = s || []; finishIfAll(); },
      error: () => finishIfAll(),
    });
    this.api.getCategories().subscribe({
      next: (c) => { this.categories = c || []; finishIfAll(); },
      error: () => finishIfAll(),
    });
    this.api.getSpecializations().subscribe({
      next: (s) => { this.specializations = s || []; finishIfAll(); },
      error: () => finishIfAll(),
    });
  }

  emptyService() {
    return { name: '', description: '', price: '', specific_photo: '', service_category_id: '', specialization_id: '' };
  }

  emptyCategory() {
    return { name: '', description: '', is_favorite: false };
  }

  // ─── Services ───

  openCreateService(): void {
    this.serviceForm = this.emptyService();
    this.editingServiceId = null;
    this.serviceError = '';
    this.showServiceModal = true;
  }

  openEditService(s: any): void {
    this.serviceForm = {
      name: s.name,
      description: s.description || '',
      price: s.price?.toString() || '',
      specific_photo: s.specific_photo || '',
      service_category_id: s.service_category_id?.toString() || '',
      specialization_id: s.specialization_id?.toString() || '',
    };
    this.editingServiceId = s.id;
    this.serviceError = '';
    this.showServiceModal = true;
  }

  saveService(): void {
    if (!this.serviceForm.name.trim()) { this.serviceError = 'Введите название'; return; }
    this.savingService = true;
    this.serviceError = '';

    const payload: any = { name: this.serviceForm.name.trim() };
    if (this.serviceForm.description) payload.description = this.serviceForm.description;
    if (this.serviceForm.specific_photo) payload.specific_photo = this.serviceForm.specific_photo;
    if (this.serviceForm.price) payload.price = parseInt(this.serviceForm.price, 10);
    if (this.serviceForm.service_category_id) payload.service_category_id = parseInt(this.serviceForm.service_category_id, 10);
    if (this.serviceForm.specialization_id) payload.specialization_id = parseInt(this.serviceForm.specialization_id, 10);

    const req = this.editingServiceId
      ? this.api.adminUpdateService(this.editingServiceId, payload)
      : this.api.adminCreateService(payload);

    req.subscribe({
      next: () => { this.savingService = false; this.showServiceModal = false; this.toast.success('Услуга сохранена'); this.loadAll(); },
      error: (e) => { this.savingService = false; this.serviceError = e?.error?.error || 'Ошибка'; },
    });
  }

  deleteService(id: number): void {
    if (!confirm('Удалить услугу?')) return;
    this.api.adminDeleteService(id).subscribe({
      next: () => { this.toast.success('Услуга удалена'); this.loadAll(); },
      error: (e) => this.toast.error(e?.error?.error || 'Ошибка'),
    });
  }

  // ─── Categories ───

  openCreateCategory(): void {
    this.categoryForm = this.emptyCategory();
    this.editingCategoryId = null;
    this.categoryError = '';
    this.showCategoryModal = true;
  }

  openEditCategory(c: any): void {
    this.categoryForm = { name: c.name, description: c.description || '', is_favorite: c.is_favorite || false };
    this.editingCategoryId = c.id;
    this.categoryError = '';
    this.showCategoryModal = true;
  }

  saveCategory(): void {
    if (!this.categoryForm.name.trim()) { this.categoryError = 'Введите название'; return; }
    this.savingCategory = true;
    this.categoryError = '';

    const payload: any = { name: this.categoryForm.name.trim() };
    if (this.categoryForm.description) payload.description = this.categoryForm.description;

    const req = this.editingCategoryId
      ? this.api.adminUpdateCategory(this.editingCategoryId, payload)
      : this.api.adminCreateCategory(payload);

    req.subscribe({
      next: () => { this.savingCategory = false; this.showCategoryModal = false; this.toast.success('Категория сохранена'); this.loadAll(); },
      error: (e) => { this.savingCategory = false; this.categoryError = e?.error?.error || 'Ошибка'; },
    });
  }

  toggleFavorite(id: number): void {
    this.api.adminToggleFavoriteCategory(id).subscribe({
      next: () => { this.toast.success('Обновлено'); this.loadAll(); },
      error: (e) => this.toast.error(e?.error?.error || 'Ошибка'),
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Удалить категорию?')) return;
    this.api.adminDeleteCategory(id).subscribe({
      next: () => { this.toast.success('Категория удалена'); this.loadAll(); },
      error: (e) => this.toast.error(e?.error?.error || 'Ошибка'),
    });
  }

  // ─── Specializations ───

  openCreateSpec(): void {
    this.specForm = { name: '', description: '' };
    this.editingSpecId = null;
    this.specError = '';
    this.showSpecModal = true;
  }

  openEditSpec(s: any): void {
    this.specForm = { name: s.name, description: s.description || '' };
    this.editingSpecId = s.id;
    this.specError = '';
    this.showSpecModal = true;
  }

  saveSpec(): void {
    if (!this.specForm.name.trim()) { this.specError = 'Введите название'; return; }
    this.savingSpec = true;
    this.specError = '';

    const payload: any = { name: this.specForm.name.trim() };
    if (this.specForm.description) payload.description = this.specForm.description;

    const req = this.editingSpecId
      ? this.api.adminUpdateSpecialization(this.editingSpecId, payload)
      : this.api.adminCreateSpecialization(payload);

    req.subscribe({
      next: () => { this.savingSpec = false; this.showSpecModal = false; this.toast.success('Специализация сохранена'); this.loadAll(); },
      error: (e) => { this.savingSpec = false; this.specError = e?.error?.error || 'Ошибка'; },
    });
  }

  deleteSpec(id: number): void {
    if (!confirm('Удалить специализацию?')) return;
    this.api.adminDeleteSpecialization(id).subscribe({
      next: () => { this.toast.success('Удалено'); this.loadAll(); },
      error: (e) => this.toast.error(e?.error?.error || 'Ошибка'),
    });
  }

  // ─── Helpers ───

  categoryName(id: number | null): string {
    if (!id) return '—';
    return this.categories.find((c) => c.id === id)?.name || '—';
  }

  specName(id: number | null): string {
    if (!id) return '—';
    return this.specializations.find((s) => s.id === id)?.name || '—';
  }
}
