import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AccountService } from '../../services/account.service';
import { FileService } from '../../services/file.service';
import { User } from '../../models/user.models';
import { Account } from '../../models/account.models';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { catchError, of, finalize } from 'rxjs';
import { EnvironmentService } from '../../services/environment.service';
import { ErrorService } from '../../services/error.service';
import { ToastService } from '../../services/toast.service';
import { DateUtilService } from '../../services/date-util.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  userData!: User | null;
  accountData!: Account;
  loading = true;
  error = '';

  accountForm!: FormGroup;
  isSubmitting = false;
  editMode = false;

  selectedFile: File | null = null;
  profileImageUrl: string | null = null;
  isUploadingImage = false;
  uploadProgress = 0;

  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private fileService = inject(FileService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private env = inject(EnvironmentService);
  private errorService = inject(ErrorService);
  private toastService = inject(ToastService);
  private dateUtil = inject(DateUtilService);
  ngOnInit(): void {
    this.initForm();
    this.loadUserProfile();
    this.loadProfileImage();
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
  loadUserProfile() {
    const user = this.authService.getUserInfo();
    if (!user?.id) {
      this.error = 'Usuário não encontrado';
      this.loading = false;
      return;
    }
    this.userData = this.authService.getUserInfo();

    const existingAccount = this.accountService.getAccountInfo();
    if (existingAccount) {
      this.populateFormWithAccountData(existingAccount);
      this.loading = false;
      return;
    }

    this.getAccountData(user.id).subscribe({
      next: (account) => {
        this.error = '';
        if (account) {
          this.accountService.storeAccountData(account);
          this.populateFormWithAccountData(account);
        } else {
          this.editMode = true;
        }

        this.loading = false;
      },
      error: (err) => {
        if (err.url && !err.url.includes('/account/')) {
          this.error = this.errorService.handleError(
            err,
            'Erro ao carregar dados do perfil. Por favor, tente novamente.'
          );
        } else {
          this.editMode = true;
          this.error = '';
        }
        this.loading = false;
      },
    });
  }
  private populateFormWithAccountData(account: Account): void {
    this.accountData = account;
    const accountType = account.cpf ? 'personal' : 'business';
    const formattedBirthdayDate = account.birthdayDate
      ? this.dateUtil.formatDateForDateInput(account.birthdayDate)
      : null;

    const currentFormData: any = {
      accountType: accountType,
      role: account.role || 'Donor',
      birthdayDate: formattedBirthdayDate,
      allowsAdvertising: account.allowsAdvertising,
    };

    if (accountType === 'personal') {
      currentFormData.name = account.name;
      currentFormData.cpf = account.cpf;
    } else {
      currentFormData.businessName = account.businessName;
      currentFormData.cnpj = account.cnpj;
    }

    if (account.address) {
      currentFormData.address = account.address;
    }

    if (account.phone) {
      currentFormData.phone = account.phone;
    }

    this.accountForm.patchValue(currentFormData);
  }

  private getAccountData(userId: string) {
    return this.accountService.getAccountByUserId(userId).pipe(
      catchError((err) => {
        if (err.status === 404) {
          return of(null);
        }
        throw err;
      })
    );
  }
  toggleEditMode(): void {
    this.editMode = !this.editMode;

    if (!this.editMode && this.accountData) {
      this.populateFormWithAccountData(this.accountData);
    }
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
      this.toastService.error(this.error);
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
    let saveOperation;

    if (this.accountData?.id) {
      saveOperation = this.accountService.updateAccount(this.accountData.id, {
        ...accountData,
        id: this.accountData.id,
      });
    } else {
      saveOperation = this.accountService.createAccount(accountData);
    }

    saveOperation.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: (response) => {
        this.accountData = response;
        this.editMode = false;
        this.error = '';

        this.accountService.storeAccountData(response);

        this.toastService.success('Perfil atualizado com sucesso!');

        if (!this.accountData.id) {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error = this.errorService.handleError(
          err,
          'Erro ao salvar dados do perfil. Por favor, tente novamente.'
        );
        this.toastService.error(this.error);
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

  loadProfileImage(): void {
    if (!this.userData?.id) return;

    this.fileService
      .getProfilePictureUrl(this.userData.id)
      .pipe(
        catchError((err) => {
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.url) {
            this.profileImageUrl = response.url;
          }
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const validation = this.fileService.validateFile(file);
      if (!validation.isValid) {
        this.toastService.error(validation.error || 'Arquivo inválido');
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfileImage(): void {
    if (!this.selectedFile || !this.userData?.id) {
      this.toastService.error('Selecione uma imagem primeiro');
      return;
    }

    this.isUploadingImage = true;
    this.uploadProgress = 0;

    this.fileService
      .uploadProfilePicture(this.userData.id, this.selectedFile)
      .pipe(
        finalize(() => {
          this.isUploadingImage = false;
          this.uploadProgress = 0;
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.url) {
            this.selectedFile = null;
            this.toastService.success(
              'Imagem de perfil atualizada com sucesso!'
            );
          }
        },
        error: (err) => {
          const errorMessage = this.errorService.handleError(
            err,
            'Erro ao fazer upload da imagem. Tente novamente.'
          );
          this.toastService.error(errorMessage);
        },
      });
  }

  removeProfileImage(): void {
    this.profileImageUrl = null;
    this.selectedFile = null;

    const fileInput = document.getElementById(
      'profileImageInput'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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
