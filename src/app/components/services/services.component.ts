import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  allServices: any[] = [];
  filteredServices: any[] = [];
  categories = [
    { id: 'all', name: 'Все' },
    { id: 'consultations', name: 'Консультации' },
    { id: 'diagnostics', name: 'Диагностика' },
    { id: 'rehabilitation', name: 'Реабилитация' },
  ];
  selectedCategory = 'all';
  loading = true;
  errorMsg = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getServices().subscribe({
      next: (data) => {
        this.allServices = data || [];
        this.filterByCategory('all');
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Не удалось загрузить услуги';
        this.loading = false;
      },
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredServices = this.allServices;
    } else {
      this.filteredServices = this.allServices.filter(
        (service) => service.category === category
      );
    }
  }
}
