import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
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

  // Unwrap {success, data} response from backend
  private unwrap<T>(obs: Observable<any>): Observable<T> {
    return obs.pipe(map((res: any) => (res && res.data !== undefined ? res.data : res)));
  }

  // --- Doctors ---
  getDoctors(): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/doctors`));
  }

  getDoctor(id: number): Observable<any> {
    return this.unwrap(this.http.get(`${API_BASE}/doctors/${id}`));
  }

  getDoctorsBySpecialization(specId: number): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/doctors/specialization/${specId}`));
  }

  // --- Services ---
  getServices(): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/services`));
  }

  getService(id: number): Observable<any> {
    return this.unwrap(this.http.get(`${API_BASE}/services/${id}`));
  }

  getServicesByCategory(categoryId: number): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/services/category/${categoryId}`));
  }

  getServicesBySpecialization(specId: number): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/services/specialization/${specId}`));
  }

  // --- Categories ---
  getCategories(): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/service-categories`));
  }

  getFavoriteCategories(): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/service-categories/favorite`));
  }

  // --- Specializations ---
  getSpecializations(): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/specializations`));
  }

  // --- Schedules & Slots ---
  getDoctorSchedule(doctorId: number): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/doctors/${doctorId}/schedule`));
  }

  getAvailableSlots(doctorId: number, date: string): Observable<any> {
    return this.unwrap(this.http.get(`${API_BASE}/appointments/slots/${doctorId}?date=${date}`));
  }

  // --- Auth ---
  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(`${API_BASE}/auth/login`, payload);
  }

  register(payload: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${API_BASE}/auth/register`, payload);
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${API_BASE}/auth/refresh`, { refresh_token: refreshToken });
  }

  logoutBackend(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post(`${API_BASE}/auth/logout`, { refresh_token: refreshToken }, this.getAuthHeaders());
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      this.logoutBackend().subscribe({ error: () => {} });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
  }

  setAuthenticated(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  getUserRole(): string {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role_name || 'user';
    } catch {
      return 'user';
    }
  }

  // --- User Profile ---
  getUserProfile(): Observable<any> {
    return this.unwrap(this.http.get(`${API_BASE}/users/me`, this.getAuthHeaders()));
  }

  updateUserProfile(payload: any): Observable<any> {
    return this.unwrap(this.http.put(`${API_BASE}/users/me`, payload, this.getAuthHeaders()));
  }

  // --- Appointments ---
  getUserAppointments(): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/appointments/me`, this.getAuthHeaders()));
  }

  bookAppointment(payload: any): Observable<any> {
    return this.unwrap(this.http.post(`${API_BASE}/appointments`, payload, this.getAuthHeaders()));
  }

  updateAppointment(id: number, payload: any): Observable<any> {
    return this.unwrap(this.http.put(`${API_BASE}/appointments/${id}`, payload, this.getAuthHeaders()));
  }

  cancelAppointment(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/appointments/${id}`, this.getAuthHeaders());
  }

  // --- Callback Requests ---
  createCallbackRequest(payload: { name: string; phone: string; message?: string }): Observable<any> {
    return this.http.post(`${API_BASE}/callback-requests`, payload);
  }

  // --- Admin: Users ---
  adminGetAllUsers(): Observable<any[]> {
    return this.http.get<any>(`${API_BASE}/users?limit=100`, this.getAuthHeaders()).pipe(
      map((res: any) => {
        const unwrapped = res?.data ?? res;
        return Array.isArray(unwrapped) ? unwrapped : (unwrapped?.data ?? []);
      })
    );
  }

  adminDeleteUser(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/users/${id}`, this.getAuthHeaders());
  }

  // --- Admin: Doctors ---
  adminCreateDoctor(payload: any): Observable<any> {
    return this.unwrap(this.http.post(`${API_BASE}/doctors`, payload, this.getAuthHeaders()));
  }

  adminUpdateDoctor(id: number, payload: any): Observable<any> {
    return this.unwrap(this.http.put(`${API_BASE}/doctors/${id}`, payload, this.getAuthHeaders()));
  }

  adminDeleteDoctor(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/doctors/${id}`, this.getAuthHeaders());
  }

  // --- Admin: Services ---
  adminCreateService(payload: any): Observable<any> {
    return this.unwrap(this.http.post(`${API_BASE}/services`, payload, this.getAuthHeaders()));
  }

  adminUpdateService(id: number, payload: any): Observable<any> {
    return this.unwrap(this.http.put(`${API_BASE}/services/${id}`, payload, this.getAuthHeaders()));
  }

  adminDeleteService(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/services/${id}`, this.getAuthHeaders());
  }

  // --- Admin: Categories ---
  adminCreateCategory(payload: any): Observable<any> {
    return this.unwrap(this.http.post(`${API_BASE}/service-categories`, payload, this.getAuthHeaders()));
  }

  adminUpdateCategory(id: number, payload: any): Observable<any> {
    return this.unwrap(this.http.put(`${API_BASE}/service-categories/${id}`, payload, this.getAuthHeaders()));
  }

  adminToggleFavoriteCategory(id: number): Observable<any> {
    return this.http.patch(`${API_BASE}/service-categories/${id}/favorite`, {}, this.getAuthHeaders());
  }

  adminDeleteCategory(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/service-categories/${id}`, this.getAuthHeaders());
  }

  // --- Admin: Specializations ---
  adminCreateSpecialization(payload: any): Observable<any> {
    return this.unwrap(this.http.post(`${API_BASE}/specializations`, payload, this.getAuthHeaders()));
  }

  adminUpdateSpecialization(id: number, payload: any): Observable<any> {
    return this.unwrap(this.http.put(`${API_BASE}/specializations/${id}`, payload, this.getAuthHeaders()));
  }

  adminDeleteSpecialization(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/specializations/${id}`, this.getAuthHeaders());
  }

  // --- Admin: Schedules ---
  adminGetAllSchedules(): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/schedules`, this.getAuthHeaders()));
  }

  adminCreateSchedule(payload: any): Observable<any> {
    return this.unwrap(this.http.post(`${API_BASE}/schedules`, payload, this.getAuthHeaders()));
  }

  adminUpdateSchedule(id: number, payload: any): Observable<any> {
    return this.unwrap(this.http.put(`${API_BASE}/schedules/${id}`, payload, this.getAuthHeaders()));
  }

  adminDeleteSchedule(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/schedules/${id}`, this.getAuthHeaders());
  }

  // --- Admin: Appointments ---
  adminGetAllAppointments(): Observable<any[]> {
    return this.http.get<any>(`${API_BASE}/appointments?limit=100`, this.getAuthHeaders()).pipe(
      map((res: any) => {
        const unwrapped = res?.data ?? res;
        return Array.isArray(unwrapped) ? unwrapped : (unwrapped?.data ?? []);
      })
    );
  }

  adminUpdateAppointment(id: number, payload: any): Observable<any> {
    return this.unwrap(this.http.put(`${API_BASE}/appointments/${id}`, payload, this.getAuthHeaders()));
  }

  adminCreateAppointmentForPatient(payload: {
    doctor_id: number;
    scheduled_at: string;
    notes?: string;
    patient_id?: number;
    guest_name?: string;
    guest_phone?: string;
  }): Observable<any> {
    return this.unwrap(
      this.http.post(`${API_BASE}/appointments/admin`, payload, this.getAuthHeaders())
    );
  }

  // --- Doctor ---
  getUser(id: number): Observable<any> {
    return this.unwrap(this.http.get(`${API_BASE}/users/${id}`, this.getAuthHeaders()));
  }

  getDoctorProfile(): Observable<any> {
    return this.unwrap(this.http.get(`${API_BASE}/doctors/me`, this.getAuthHeaders()));
  }

  getDoctorAppointments(): Observable<any[]> {
    return this.unwrap(this.http.get(`${API_BASE}/doctors/me/appointments`, this.getAuthHeaders()));
  }

  addAppointmentResult(appointmentId: number, payload: any): Observable<any> {
    return this.unwrap(
      this.http.post(`${API_BASE}/appointments/${appointmentId}/result`, payload, this.getAuthHeaders())
    );
  }

  // --- Admin: Callback Requests ---
  adminGetCallbackRequests(): Observable<any[]> {
    return this.http.get<any>(`${API_BASE}/callback-requests?limit=100`, this.getAuthHeaders()).pipe(
      map((res: any) => {
        const unwrapped = res?.data ?? res;
        return Array.isArray(unwrapped) ? unwrapped : (unwrapped?.data ?? []);
      })
    );
  }

  adminUpdateCallbackRequest(id: number, payload: any): Observable<any> {
    return this.unwrap(this.http.put(`${API_BASE}/callback-requests/${id}`, payload, this.getAuthHeaders()));
  }

  adminDeleteCallbackRequest(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/callback-requests/${id}`, this.getAuthHeaders());
  }
}