import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-details.component.html',
  styleUrls: ['./doctor-details.component.scss'],
})
export class DoctorDetailsComponent implements OnInit {
  doctor: any = null;
  loading = true;
  errorMsg = '';

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMsg = 'Некорректный ID врача.';
      this.loading = false;
      return;
    }

    this.api.getDoctor(id).subscribe({
      next: (data) => { this.doctor = data; this.loading = false; },
      error: () => { this.errorMsg = 'Не удалось получить данные врача'; this.loading = false; },
    });
  }
}
