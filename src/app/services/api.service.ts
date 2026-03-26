import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

const API_BASE = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  // Doctors
  getDoctors(): Observable<any> {
    return this.http.get(`${API_BASE}/doctors`);
  }

  getDoctor(id: number): Observable<any> {
    return this.http.get(`${API_BASE}/doctors/${id}`);
  }

  // Services
  getServices(): Observable<any> {
    return this.http.get(`${API_BASE}/services`);
  }

  getServicesByCategory(category: string): Observable<any> {
    return this.http.get(`${API_BASE}/services?category=${category}`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${API_BASE}/service-categories`);
  }

  // Carousel and Content
  getCarousel(): Observable<any> {
    return this.http.get(`${API_BASE}/carousel`);
  }

  getClinicInfo(): Observable<any> {
    return this.http.get(`${API_BASE}/clinic/info`);
  }

  getClinicLicenses(): Observable<any> {
    return this.http.get(`${API_BASE}/clinic/licenses`);
  }

  getClinicGallery(): Observable<any> {
    return this.http.get(`${API_BASE}/clinic/gallery`);
  }

  // Auth
  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(`${API_BASE}/auth/login`, payload);
  }

  register(payload: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${API_BASE}/auth/register`, payload);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
  }

  setAuthenticated(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  // User Profile
  getUserProfile(): Observable<any> {
    return this.http.get(`${API_BASE}/users/me`, this.getAuthHeaders());
  }

  updateUserProfile(payload: any): Observable<any> {
    return this.http.put(`${API_BASE}/users/me`, payload, this.getAuthHeaders());
  }

  // User Appointments
  getUserAppointments(): Observable<any> {
    return this.http.get(`${API_BASE}/userss/appointments`, this.getAuthHeaders());
  }

  bookAppointment(payload: any): Observable<any> {
    return this.http.post(`${API_BASE}/users/appointments`, payload, this.getAuthHeaders());
  }

  cancelAppointment(appointmentId: number): Observable<any> {
    return this.http.delete(`${API_BASE}/users/appointments/${appointmentId}`, this.getAuthHeaders());
  }

  // Callback request
  requestCallback(payload: { phone: string; name: string }): Observable<any> {
    return this.http.post(`${API_BASE}/callback-request`, payload);
  }
}
