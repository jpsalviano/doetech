import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AccountService } from '../../../services/account.service';
import { ToastService } from '../../../services/toast.service';
import { DateUtilService } from '../../../services/date-util.service';
import { User } from '../../../models/user.models';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ErrorService } from '../../../services/error.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-register-incomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './register-incomplete.component.html',
  styleUrls: ['./register-incomplete.component.css'],
})
export class RegisterIncompleteComponent implements OnInit {
  userData!: User | null;
  loading = true;
  error = '';

  accountForm!: FormGroup;
  isSubmitting = false;
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private errorService = inject(ErrorService);
  private dateUtil = inject(DateUtilService);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.initForm();
    this.loadUserInfo();
  }

  initForm(): void {
    this.accountForm = this.fb.group({
      accountType: ['personal', Validators.required],
      name: [''],
      cpf: [''],
      businessName: [''],
      cnpj: [''],
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
    });

    this.accountTypeControl?.valueChanges.subscribe((accountType) => {
      this.updateValidators(accountType);
    });

    this.updateValidators(this.accountTypeControl?.value);
  }

  private updateValidators(accountType: string): void {
    if (accountType === 'personal') {
      this.nameControl?.setValidators([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]);
      this.cpfControl?.setValidators([
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
      ]);
      this.businessNameControl?.clearValidators();
      this.cnpjControl?.clearValidators();
    } else {
      this.businessNameControl?.setValidators([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]);
      this.cnpjControl?.setValidators([
        Validators.required,
        Validators.minLength(14),
        Validators.maxLength(14),
      ]);
      this.nameControl?.clearValidators();
      this.cpfControl?.clearValidators();
    }

    this.nameControl?.updateValueAndValidity();
    this.cpfControl?.updateValueAndValidity();
    this.businessNameControl?.updateValueAndValidity();
    this.cnpjControl?.updateValueAndValidity();
  }

  loadUserInfo() {
    const user = this.authService.getUserInfo();
    if (!user?.id) {
      this.error = 'Usuário não encontrado';
      this.loading = false;
      return;
    }
    this.loading = false;
    this.userData = user;
  }

  onSubmit(): void {
    if (this.accountForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched(this.accountForm);
      return;
    }

    this.isSubmitting = true;
    const user = this.authService.getUserInfo();
    if (!user?.id) {
      this.error = 'Usuário não encontrado';
      this.isSubmitting = false;
      return;
    }

    const formData = this.accountForm.value;
    const accountData: any = {
      userId: user.id,
      allowsAdvertising: formData.allowsAdvertising,
      role: formData.role,
      address: formData.address,
      phone: formData.phone,
    };
    if (formData.birthdayDate) {
      accountData.birthdayDate = this.dateUtil.formatDateToTimestamp(
        formData.birthdayDate
      );
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
    this.accountService.createAccount(accountData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.accountService.storeAccountData(accountData);
        this.toastService.success('Perfil completado com sucesso!');
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1500);
      },
      error: (err) => {
        this.error = this.errorService.handleError(
          err,
          'Erro ao salvar dados da conta. Por favor, tente novamente.'
        );
        this.toastService.error(this.error);
        this.isSubmitting = false;
      },
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
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

  get accountTypeControl(): AbstractControl | null {
    return this.accountForm?.get('accountType');
  }

  get nameControl(): AbstractControl | null {
    return this.accountForm?.get('name');
  }

  get cpfControl(): AbstractControl | null {
    return this.accountForm?.get('cpf');
  }

  get businessNameControl(): AbstractControl | null {
    return this.accountForm?.get('businessName');
  }

  get cnpjControl(): AbstractControl | null {
    return this.accountForm?.get('cnpj');
  }

  get birthdayDateControl(): AbstractControl | null {
    return this.accountForm?.get('birthdayDate');
  }

  get roleControl(): AbstractControl | null {
    return this.accountForm?.get('role');
  }

  get addressControl(): FormGroup | null {
    return this.accountForm?.get('address') as FormGroup;
  }

  get phoneControl(): FormGroup | null {
    return this.accountForm?.get('phone') as FormGroup;
  }
}
