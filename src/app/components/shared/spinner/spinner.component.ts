import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="spinner-overlay">
      <mat-progress-spinner mode="indeterminate" [diameter]="48" color="primary" />
    </div>
  `,
  styles: [`
    .spinner-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      width: 100%;
    }
  `],
})
export class SpinnerComponent {}
