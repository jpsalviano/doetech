import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ErrorService } from '../../../services/error.service';

@Component({
  selector: 'app-recover-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css'
})
export class RecoverPasswordComponent {
  recoverForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private errorService: ErrorService
  ) {
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get emailControl() {
    return this.recoverForm.get('email');
  }

  getEmailErrorMessage(): string {
    const emailControl = this.emailControl;
    if (emailControl?.invalid && emailControl?.touched) {
      return this.errorService.getValidationErrorMessage('Email', emailControl.errors);
    }
    return '';
  }

  onSubmit() {
    if (this.recoverForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const email = this.recoverForm.value.email;

      this.authService.recoverPassword(email).subscribe({
        next: () => {
          this.router.navigate(['/password-reset-confirmation'], {
            queryParams: { email: email }
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = this.errorService.handleError(error, 'Erro ao enviar email de recuperação. Tente novamente.');
        }
      });
    }
  }
}
