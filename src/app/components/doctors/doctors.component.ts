import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.scss'],
})
export class DoctorsComponent implements OnInit {
  doctors = [];
  loading = true;

  constructor(private api: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef, private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.set('Наши врачи — МЕДЛАЙФ', 'Опытные специалисты клиники МЕДЛАЙФ — кардиология, педиатрия, гастроэнтерология и другие направления.');
    this.api.getDoctors().subscribe({
      next: (data: any) => {
        this.doctors = data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Не удалось загрузить список врачей');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
