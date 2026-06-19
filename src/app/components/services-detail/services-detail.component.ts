import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';

@Component({
  selector: 'app-services-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './services-detail.component.html',
  styleUrls: ['./services-detail.component.scss'],
})
export class ServicesDetailComponent implements OnInit {
  service: any = null;
  loading = true;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!id || isNaN(id)) {
      this.toast.error('Некорректный ID услуги');
      this.loading = false;
      return;
    }

    this.api.getService(id).subscribe({
      next: (service) => {
        this.service = service;
        const desc = service.description
          ? service.description
          : `Услуга ${service.name} в клинике МЕДЛАЙФ.`;
        this.seo.set(`${service.name} — МЕДЛАЙФ`, desc);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Ошибка загрузки данных услуги');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/services']);
  }
}
