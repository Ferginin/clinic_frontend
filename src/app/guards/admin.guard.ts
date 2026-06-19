import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const api = inject(ApiService);

  if (!localStorage.getItem('token')) {
    router.navigate(['/auth']);
    return false;
  }

  if (api.getUserRole() !== 'admin') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
