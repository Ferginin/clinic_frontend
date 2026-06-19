import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  timeline = [
    {
      year: '20**',
      text: 'Год основания',
    },
    {
      year: '20**',
      text: 'Новый уровень заботы: «Клиника» открывает современное пространство для вашего здоровья',
    },
    {
      year: '20** - По настоящее время',
      text: 'Новые врачи. Новые возможности диагностики!',
    },
  ];

  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.set('О клинике — Клиника', 'История и преимущества медицинского центра Клиника с 20** года.');
  }
}
