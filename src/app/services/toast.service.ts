import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration = 3000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['toast-success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  error(message: string, duration = 4000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['toast-error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  info(message: string, duration = 3000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['toast-info'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
