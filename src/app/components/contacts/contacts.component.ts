import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from '../../pipes/safe.pipe';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, SafePipe],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent {
  clinicAddress = 'г. Москва, ул. Примерная, д. 1';
  clinicPhone1 = '+7 (999) 123-45-67';
  clinicPhone2 = '+7 (999) 123-45-68';
  clinicEmail = 'info@clinic.ru';
  workingHours = [
    { day: 'Понедельник - Пятница', time: '08:00 - 20:00' },
    { day: 'Суббота', time: '09:00 - 18:00' },
    { day: 'Воскресенье', time: 'Выходной' },
  ];
  mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2247.1234567890!2d37.6172!3d55.7558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54a5b5b5b5b5b%3A0x5b5b5b5b5b5b5b5b!2z0JzQuNGF0YDQsNC70LjQvdCwLCDQnC4g0JzQvtGB0YLQsNC90LjRgtGP!5e0!3m2!1sru!2sru!4v1234567890';
}
