import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-callback-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './callback-request.component.html',
  styleUrls: ['./callback-request.component.scss']
})
export class CallbackRequestComponent {
  @Input() showModal = false;
  @Output() closeModal = new EventEmitter<void>();

  callbackForm: FormGroup;
  isSubmitting = false;
  isSubmitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.callbackForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)]],
      message: [''],
      agree: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.callbackForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      this.apiService.createCallbackRequest(this.callbackForm.value).subscribe({
        next: (response) => {
          this.isSubmitted = true;
          this.callbackForm.reset();
        },
        error: (error) => {
          this.errorMessage = 'Failed to submit request. Please try again.';
          console.error('Error submitting callback request:', error);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.callbackForm.controls).forEach(key => {
      const control = this.callbackForm.get(key);
      control?.markAsTouched();
    });
  }

  resetForm(): void {
    this.isSubmitted = false;
    this.errorMessage = '';
    this.callbackForm.reset();
  }

  onClose(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  get name() { return this.callbackForm.get('name'); }
  get phone() { return this.callbackForm.get('phone'); }
  get message() { return this.callbackForm.get('message'); }
}