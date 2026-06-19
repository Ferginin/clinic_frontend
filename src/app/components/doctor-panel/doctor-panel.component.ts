import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';

@Component({
  selector: 'app-doctor-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './doctor-panel.component.html',
  styleUrls: ['./doctor-panel.component.scss'],
})
export class DoctorPanelComponent implements OnInit {
  doctor: any = null;
  loading = true;

  constructor(private api: ApiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadDoctorProfile();
  }

  loadDoctorProfile(): void {
    this.loading = true;
    this.api.getDoctorProfile().subscribe({
      next: (data) => {
        this.doctor = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Врачебный кабинет не настроен или произошла ошибка');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
