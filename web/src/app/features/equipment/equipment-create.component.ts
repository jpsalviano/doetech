import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { AccountService } from '../../services/account.service';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../services/toast.service';
import { ErrorService } from '../../services/error.service';
import { DateUtilService } from '../../services/date-util.service';
import {
  CreateEquipmentRequest,
  EquipmentType,
} from '../../models/equipment.models';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-equipment-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './equipment-create.component.html',
  styleUrls: ['./equipment-create.component.css'],
})
export class EquipmentCreateComponent implements OnInit {
  equipmentForm!: FormGroup;
  isSubmitting = false;
  error = '';

  selectedFile: File | null = null;
  equipmentImageUrl: string | null = null;
  isUploadingImage = false;
  uploadProgress = 0;

  equipmentTypes = [
    { value: EquipmentType.Desktop, label: 'Desktop' },
    { value: EquipmentType.SmartPhone, label: 'Smartphone' },
    { value: EquipmentType.Tablet, label: 'Tablet' },
    { value: EquipmentType.Notebook, label: 'Notebook' },
    { value: EquipmentType.Peripherals, label: 'Periféricos' },
  ];
  private equipmentService = inject(EquipmentService);
  private accountService = inject(AccountService);
  private fileService = inject(FileService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private errorService = inject(ErrorService);
  private dateUtil = inject(DateUtilService);

  ngOnInit(): void {
    this.initForm();
  }
  initForm(): void {
    this.equipmentForm = this.fb.group({
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      type: ['', Validators.required],
      avaiabilityDate: [
        this.dateUtil.getTodayForDateInput(),
        Validators.required,
      ],
    });
  }
  onSubmit(): void {
    if (this.equipmentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    const currentAccount = this.accountService.getAccountInfo();
    if (!currentAccount || !currentAccount.id) {
      this.error =
        'Erro: informações da conta não encontradas. Faça login novamente.';
      this.toastService.error(this.error);
      return;
    }

    const formValue = this.equipmentForm.value;
    const request: CreateEquipmentRequest = {
      donorAccountId: currentAccount.id,
      description: formValue.description,
      type: formValue.type,
      avaiabilityDate:
        this.dateUtil.formatDateToTimestamp(formValue.avaiabilityDate) || 0,
    };

    this.isSubmitting = true;
    this.error = '';
    this.equipmentService
      .createEquipment(request)
      .pipe(
        catchError((error) => {
          this.error = this.errorService.handleError(
            error,
            'Erro ao cadastrar equipamento. Tente novamente.'
          );
          this.toastService.error(this.error);
          return of(null);
        }),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: (equipment) => {
          if (equipment) {
            this.toastService.success('Equipamento cadastrado com sucesso!');

            if (this.selectedFile) {
              this.uploadEquipmentImage(equipment.id);
            }

            this.router.navigate(['/donor/equipment', equipment.id]);
          }
        },
      });
  }
  goBack(): void {
    this.router.navigate(['/donor/equipment']);
  }
  private markFormGroupTouched(): void {
    Object.keys(this.equipmentForm.controls).forEach((key) => {
      const control = this.equipmentForm.get(key);
      control?.markAsTouched();
    });
  }

  get description() {
    return this.equipmentForm.get('description');
  }
  get type() {
    return this.equipmentForm.get('type');
  }
  get avaiabilityDate() {
    return this.equipmentForm.get('avaiabilityDate');
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
        this.equipmentImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadEquipmentImage(equipmentId: string): void {
    if (!this.selectedFile) return;

    this.isUploadingImage = true;
    this.uploadProgress = 0;

    this.fileService
      .uploadEquipmentPicture(equipmentId, this.selectedFile)
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
              'Imagem do equipamento enviada com sucesso!'
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

  removeEquipmentImage(): void {
    this.equipmentImageUrl = null;
    this.selectedFile = null;

    const fileInput = document.getElementById(
      'equipmentImageInput'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
