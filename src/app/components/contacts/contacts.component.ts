import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.set('Контакты — МЕДЛАЙФ', 'Адрес, телефоны и режим работы клиники МЕДЛАЙФ в Кемерово.');
  }
}
