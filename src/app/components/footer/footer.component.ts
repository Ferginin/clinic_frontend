import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  clinicAddress = 'г. Москва, ул. Примерная, д. 1';
  clinicEmail = 'info@clinic.ru';
  clinicPhone1 = '+7 (999) 123-45-67';
  clinicPhone2 = '+7 (999) 123-45-68';
}
