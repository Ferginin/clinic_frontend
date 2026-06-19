import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class doctorGuard implements CanActivate {
  constructor(private api: ApiService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const role = this.api.getUserRole();
    if (role === 'doctor') {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
