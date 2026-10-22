import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';
import { ErrorService } from '../../../services/error.service';
import { ToastService } from '../../../services/toast.service';
import { DateUtilService } from '../../../services/date-util.service';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxMaskDirective],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  currentSection: 'user' | 'account' = 'user';
  isSubmitting = false;
  errorMessage: string | null = null;
  userCredentialsSubmitted = false;
  registeredUserId: string | null = null;
  savedEmail: string | null = null;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private accountService: AccountService,
    private router: Router,
    private errorService: ErrorService,
    private toastService: ToastService,
    private dateUtil: DateUtilService
  ) {
    this.registerForm = this.createForm();
  }

  ngOnInit(): void {
    this.updateValidators();

    this.accountTypeControl?.valueChanges.subscribe(() => {
      this.updateValidators();
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      user: this.fb.group(
        {
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', [Validators.required]],
        },
        { validators: this.passwordMatchValidator }
      ),
      account: this.fb.group({
        accountType: ['personal', Validators.required],
        name: ['', [Validators.minLength(5), Validators.maxLength(100)]],
        cpf: ['', [Validators.minLength(11), Validators.maxLength(11)]],
        businessName: [
          '',
          [Validators.minLength(5), Validators.maxLength(100)],
        ],
        cnpj: ['', [Validators.minLength(14), Validators.maxLength(14)]],
        birthdayDate: [null, Validators.required],
        role: ['Donor', Validators.required],
        allowsAdvertising: [false],
        address: this.fb.group({
          street: [
            '',
            [
              Validators.required,
              Validators.minLength(5),
              Validators.maxLength(150),
            ],
          ],
          number: [
            '',
            [
              Validators.required,
              Validators.minLength(1),
              Validators.maxLength(10),
            ],
          ],
          complement: ['', [Validators.maxLength(150)]],
          district: [
            '',
            [
              Validators.required,
              Validators.minLength(5),
              Validators.maxLength(150),
            ],
          ],
          city: [
            '',
            [
              Validators.required,
              Validators.minLength(5),
              Validators.maxLength(150),
            ],
          ],
          state: [
            '',
            [
              Validators.required,
              Validators.minLength(5),
              Validators.maxLength(150),
            ],
          ],
          postalCode: [
            '',
            [
              Validators.required,
              Validators.minLength(8),
              Validators.maxLength(8),
            ],
          ],
        }),
        phone: this.fb.group({
          countryCode: [
            '',
            [
              Validators.required,
              Validators.minLength(1),
              Validators.maxLength(3),
            ],
          ],
          stateCode: [
            '',
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(2),
            ],
          ],
          phoneNumber: [
            '',
            [
              Validators.required,
              Validators.minLength(8),
              Validators.maxLength(9),
            ],
          ],
        }),
      }),
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.isSubmitting = true;

    if (this.currentSection === 'user' && !this.userCredentialsSubmitted) {
      this.registerUser();
    } else if (
      this.currentSection === 'account' &&
      this.userCredentialsSubmitted
    ) {
      this.createAccount();
    }
  }

  switchSection(section: 'user' | 'account'): void {
    if (section === 'account' && !this.userCredentialsSubmitted) {
      this.onSubmit();
      return;
    }

    this.currentSection = section;
    this.updateValidators();
  }

  private updateValidators(): void {
    const accountType = this.accountTypeControl?.value;

    const nameValidators = [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(100),
    ];
    const cpfValidators = [
      Validators.required,
      Validators.minLength(11),
      Validators.maxLength(11),
    ];
    const businessNameValidators = [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(100),
    ];
    const cnpjValidators = [
      Validators.required,
      Validators.minLength(14),
      Validators.maxLength(14),
    ];

    if (accountType === 'personal') {
      this.nameControl?.setValidators(nameValidators);
      this.cpfControl?.setValidators(cpfValidators);

      this.businessNameControl?.clearValidators();
      this.cnpjControl?.clearValidators();
      this.businessNameControl?.setValue('');
      this.cnpjControl?.setValue('');
    } else {
      this.businessNameControl?.setValidators(businessNameValidators);
      this.cnpjControl?.setValidators(cnpjValidators);

      this.nameControl?.clearValidators();
      this.cpfControl?.clearValidators();
      this.nameControl?.setValue('');
      this.cpfControl?.setValue('');
    }

    this.nameControl?.updateValueAndValidity();
    this.cpfControl?.updateValueAndValidity();
    this.businessNameControl?.updateValueAndValidity();
    this.cnpjControl?.updateValueAndValidity();
  }

  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }
    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  private registerUser(): void {
    if (this.userFormGroup.invalid) {
      this.isSubmitting = false;
      return;
    }

    const { email, password } = this.userFormGroup.value;

    const userData = { email, password, isAdmin: false };

    this.authService
      .register(userData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response: any) => {
          this.userCredentialsSubmitted = true;
          this.registeredUserId = response.id;
          this.savedEmail = email;
          this.switchSection('account');
        },
        error: (error: any) => {
          this.errorMessage = this.errorService.handleError(
            error,
            'Falha ao registrar usuário. Por favor, tente novamente.'
          );
          this.toastService.error(this.errorMessage);
        },
      });
  }

  private createAccount(): void {
    if (!this.registeredUserId) {
      this.errorMessage = 'Erro no registro: ID de usuário não encontrado';
      this.isSubmitting = false;
      return;
    }

    const formData = this.accountFormGroup.value;
    const accountData: any = {
      userId: this.registeredUserId,
      allowsAdvertising: formData.allowsAdvertising,
      role: formData.role,
      address: {
        street: formData.address.street,
        number: formData.address.number,
        complement: formData.address.complement || null,
        district: formData.address.district,
        city: formData.address.city,
        state: formData.address.state,
        postalCode: formData.address.postalCode,
      },
      phone: {
        countryCode: formData.phone.countryCode,
        stateCode: formData.phone.stateCode,
        phoneNumber: formData.phone.phoneNumber,
      },
    };
    if (formData.birthdayDate) {
      const birthdayDate = this.dateUtil.formatDateToTimestamp(
        formData.birthdayDate
      );
      accountData.birthdayDate = birthdayDate;
    }

    if (formData.accountType === 'personal') {
      accountData.name = formData.name;
      accountData.cpf = formData.cpf;
      accountData.businessName = null;
      accountData.cnpj = null;
    } else {
      accountData.businessName = formData.businessName;
      accountData.cnpj = formData.cnpj;
      accountData.name = null;
      accountData.cpf = null;
    }

    this.accountService
      .createAccount(accountData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.errorMessage = null;
          this.toastService.success(
            'Conta criada com sucesso! Faça login para continuar.'
          );
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: { registered: 'true' },
            });
          }, 1500);
        },
        error: (error: any) => {
          this.errorMessage = this.errorService.handleError(
            error,
            'Falha ao criar conta. Por favor, tente novamente.'
          );
          this.toastService.error(this.errorMessage);
        },
      });
  }

  onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');
    input.value = value;

    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      if (
        controlName === 'countryCode' ||
        controlName === 'stateCode' ||
        controlName === 'phoneNumber'
      ) {
        this.phoneControl?.get(controlName)?.setValue(value);
      }
    }
  }

  get userFormGroup(): FormGroup {
    return this.registerForm.get('user') as FormGroup;
  }

  get accountFormGroup(): FormGroup {
    return this.registerForm.get('account') as FormGroup;
  }

  get emailControl(): AbstractControl | null {
    return this.userFormGroup?.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.userFormGroup?.get('password');
  }

  get confirmPasswordControl(): AbstractControl | null {
    return this.userFormGroup?.get('confirmPassword');
  }

  get accountTypeControl(): AbstractControl | null {
    return this.accountFormGroup?.get('accountType');
  }

  get nameControl(): AbstractControl | null {
    return this.accountFormGroup?.get('name');
  }

  get cpfControl(): AbstractControl | null {
    return this.accountFormGroup?.get('cpf');
  }

  get businessNameControl(): AbstractControl | null {
    return this.accountFormGroup?.get('businessName');
  }

  get cnpjControl(): AbstractControl | null {
    return this.accountFormGroup?.get('cnpj');
  }

  get birthdayDateControl(): AbstractControl | null {
    return this.accountFormGroup?.get('birthdayDate');
  }

  get addressControl(): FormGroup | null {
    return this.accountFormGroup?.get('address') as FormGroup;
  }

  get phoneControl(): FormGroup | null {
    return this.accountFormGroup?.get('phone') as FormGroup;
  }
}
