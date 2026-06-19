import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  isAdmin = false;
  isDoctor = false;
  menuOpen = false;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.isAuthenticated$.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      const role = this.apiService.getUserRole();
      this.isAdmin = isAuth && role === 'admin';
      this.isDoctor = isAuth && role === 'doctor';
    });
    this.isAuthenticated = !!localStorage.getItem('token');
    const role = this.apiService.getUserRole();
    this.isAdmin = this.isAuthenticated && role === 'admin';
    this.isDoctor = this.isAuthenticated && role === 'doctor';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.apiService.logout();
    this.router.navigate(['/']);
  }

  navigateToDoctorPanel(): void {
    this.router.navigate(['/doctor-panel']);
  }
}