import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  allServices: any[] = [];
  filteredServices: any[] = [];
  categories: any[] = [];
  selectedCategory: number | 'all' = 'all';
  loading = true;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.set('Услуги — МЕДЛАЙФ', 'Медицинские услуги клиники МЕДЛАЙФ: диагностика, лечение, консультации специалистов.');
    this.api.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
        this.cdr.markForCheck();
      },
    });

    this.api.getServices().subscribe({
      next: (data) => {
        this.allServices = data || [];
        this.loading = false;

        this.route.queryParams.subscribe((params) => {
          const catId = params['category'] ? +params['category'] : 'all';
          this.filterByCategory(catId);
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.toast.error('Не удалось загрузить услуги');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  filterByCategory(category: number | 'all'): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredServices = this.allServices;
    } else {
      this.filteredServices = this.allServices.filter(
        (s) => s.service_category_id === category,
      );
    }
  }
}
