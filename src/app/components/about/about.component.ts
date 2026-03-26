import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  gallery: any[] = [];
  licenses: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getClinicGallery().subscribe({
      next: (data) => (this.gallery = data || []),
      error: () => (this.gallery = []),
    });

    this.api.getClinicLicenses().subscribe({
      next: (data) => (this.licenses = data || []),
      error: () => (this.licenses = []),
      complete: () => (this.loading = false),
    });
  }
}
