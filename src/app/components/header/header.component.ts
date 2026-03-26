import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.isAuthenticated$.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
    });
    // Check if token exists on init
    this.isAuthenticated = !!localStorage.getItem('token');
  }

  logout(): void {
    this.apiService.logout();
    this.router.navigate(['/']);
  }
}
