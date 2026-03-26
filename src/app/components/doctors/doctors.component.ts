import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.scss'],
})
export class DoctorsComponent implements OnInit {
  doctors = [];
  loading = true;
  errorMsg = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDoctors().subscribe({
      next: (data: any) => { this.doctors = data || []; this.loading = false; },
      error: (err) => { this.errorMsg = 'Не удалось загрузить список врачей'; this.loading = false; },
    });
  }
}
