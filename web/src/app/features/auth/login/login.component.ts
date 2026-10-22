import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ErrorService } from '../../../services/error.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginRequest } from '../../../models/user.models';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Contas de exemplo, quando a API está em modo demonstração.
interface DemoInfo {
  enabled: boolean;
  password?: string;
  resetsAt?: string;
  accounts?: { role: string; email: string }[];
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  demo: DemoInfo | null = null;

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private errorService = inject(ErrorService);
  private http = inject(HttpClient);

  ngOnInit(): void {
    this.initForm();
    this.checkRegistrationSuccess();
    this.http.get<DemoInfo>('/api/v1/doetech/demo').subscribe({
      next: (info) => (this.demo = info.enabled ? info : null),
      error: () => (this.demo = null),
    });
  }

  // Preenche o formulário com uma das contas de exemplo.
  useDemo(email: string): void {
    this.loginForm.setValue({ email, password: this.demo?.password ?? '' });
  }

  private checkRegistrationSuccess(): void {
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.successMessage = 'Cadastro realizado com sucesso! Faça login para acessar sua conta.';
      }
    });
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.loginForm.valueChanges.subscribe(() => {
      if (this.errorMessage || this.successMessage) {
        this.errorMessage = '';
        this.successMessage = '';
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const loginRequest: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginRequest).subscribe({
      next: () => {
        this.authService.navigateAfterLogin();
      },
      error: (error) => {
        this.errorMessage = this.errorService.handleError(error, 'Login falhou. Verifique suas credenciais e tente novamente.');
        this.isSubmitting = false;
      }
    });
  }

  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }

  getEmailErrorMessage(): string {
    const emailControl = this.emailControl;
    if (emailControl?.invalid && emailControl?.touched) {
      return this.errorService.getValidationErrorMessage('Email', emailControl.errors);
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.passwordControl;
    if (passwordControl?.invalid && passwordControl?.touched) {
      return this.errorService.getValidationErrorMessage('Senha', passwordControl.errors);
    }
    return '';
  }
}
