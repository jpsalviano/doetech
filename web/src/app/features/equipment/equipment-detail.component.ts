import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { AccountService } from '../../services/account.service';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../services/toast.service';
import { ErrorService } from '../../services/error.service';
import { DateUtilService } from '../../services/date-util.service';
import { DonationService } from '../../services/donation.service';
import { Account } from '../../models/account.models';
import {
  Equipment,
  EquipmentStatus,
  UpdateEquipmentStatusRequest,
} from '../../models/equipment.models';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, of, finalize, retry, timer } from 'rxjs';
import { Donation } from '../../models/donation.models';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './equipment-detail.component.html',
  styleUrls: ['./equipment-detail.component.css'],
})
export class EquipmentDetailComponent implements OnInit {
  equipment: Equipment | null = null;
  donation: Donation | null = null;
  inProgressStatus = EquipmentStatus.InProgress;
  donorAccount: Account | null = null;
  loading = true;
  isLoadingDonor = false;
  error = '';
  statusForm!: FormGroup;
  isUpdatingStatus = false;
  retryCount = 0;
  maxRetries = 3;

  selectedFile: File | null = null;
  equipmentImageUrl: string | null = null;
  isUploadingImage = false;
  uploadProgress = 0;
  uploadError = '';

  availableStatuses = [
    { value: EquipmentStatus.Available, label: 'Disponível' },
    { value: EquipmentStatus.Canceled, label: 'Cancelado' },
  ];
  private equipmentService = inject(EquipmentService);
  private accountService = inject(AccountService);
  private fileService = inject(FileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private errorService = inject(ErrorService);
  private dateUtil = inject(DateUtilService);
  private donationService = inject(DonationService);

  ngOnInit(): void {
    this.initStatusForm();
    this.loadEquipment();
  }

  initStatusForm(): void {
    this.statusForm = this.fb.group({
      status: ['', Validators.required],
      reason: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });
  }

  loadEquipment(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID do equipamento não fornecido.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';
    this.retryCount = 0;
    
    this.equipmentService
      .getEquipmentById(id)
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            this.retryCount = retryCount;
            console.log(`Retry attempt ${retryCount} after error:`, error);
            return timer(1000 * retryCount);
          }
        }),
        catchError((error) => {
          this.error = this.errorService.handleError(
            error,
            'Erro ao carregar equipamento. Verifique sua conexão e tente novamente.'
          );
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (data) => {
          this.equipment = data;
          if (data) {
            this.statusForm.patchValue({ status: data.status });
            this.loadDonorInfo(data.donorAccountId);
            this.loadEquipmentImage(data.id);
            this.loadDonationInfo(data.id);
          }
        },
      });
  }

  private loadDonorInfo(donorAccountId: string): void {
    this.isLoadingDonor = true;
    this.accountService
      .getAccountById(donorAccountId)
      .pipe(
        catchError((error) => {
          const errorMessage = this.errorService.handleError(
            error,
            'Erro ao carregar informações do doador'
          );
          this.toastService.error(errorMessage);
          return of(null);
        }),
        finalize(() => (this.isLoadingDonor = false))
      )
      .subscribe({
        next: (account) => {
          this.donorAccount = account;
        },
      });
  }

  private loadDonationInfo(equipmentId: string): void {
    this.donationService
      .getDonationByEquipment(equipmentId)
      .pipe(
        catchError((error) => {
          return of(null);
        })
      )
      .subscribe({
        next: (donation) => {
          this.donation = donation;
        },
      });
  }

  loadEquipmentImage(equipmentId: string): void {
    this.fileService
      .getEquipmentPictureUrl(equipmentId)
      .pipe(
        catchError((error) => {
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.url) {
            this.equipmentImageUrl = response.url;
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
        input.value = '';
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.equipmentImageUrl = e.target.result;
      };
      reader.onerror = () => {
        this.toastService.error('Erro ao ler o arquivo selecionado');
        this.selectedFile = null;
        input.value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  uploadEquipmentImage(): void {
    if (!this.selectedFile || !this.equipment?.id) {
      this.toastService.error('Selecione uma imagem primeiro');
      return;
    }

    this.isUploadingImage = true;
    this.uploadProgress = 0;
    this.uploadError = '';

    this.fileService
      .uploadEquipmentPicture(this.equipment.id, this.selectedFile)
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
            this.uploadError = '';
            this.toastService.success(
              'Imagem do equipamento atualizada com sucesso!'
            );
          }
        },
        error: (err) => {
          this.uploadError = this.errorService.handleError(
            err,
            'Erro ao fazer upload da imagem. Tente novamente.'
          );
          this.toastService.error(this.uploadError);
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

  onUpdateStatus(): void {
    if (
      !this.equipment ||
      this.statusForm.invalid ||
      this.equipment.status == EquipmentStatus.InProgress
    )
      return;

    const request: UpdateEquipmentStatusRequest = {
      status: this.statusForm.value.status,
      reason: this.statusForm.value.reason,
    };

    this.isUpdatingStatus = true;
    this.error = '';
    this.equipmentService
      .updateEquipmentStatus(this.equipment.id, request)
      .pipe(
        catchError((error) => {
          this.error = this.errorService.handleError(
            error,
            'Erro ao atualizar status. Tente novamente.'
          );
          this.toastService.error(this.error);
          return of();
        }),
        finalize(() => (this.isUpdatingStatus = false))
      )
      .subscribe({
        next: () => {
          this.equipment!.status = request.status;
          this.statusForm.reset({
            status: request.status,
            reason: '',
          });
          this.toastService.success(
            'Status do equipamento atualizado com sucesso!'
          );
          if (request.status === EquipmentStatus.Canceled) {
            setTimeout(() => {
              this.goBack();
            }, 1500);
          }
        },
      });
  }
  goBack(): void {
    this.router.navigate(['/donor/equipment']);
  }

  onShowInterest(): void {
    if (!this.equipment) return;

    this.donationService.clearDonationCart();
    this.donationService.addEquipmentToCart(this.equipment);
    this.router.navigate(['/donation/create']);
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      Available: 'Disponível',
      InProgress: 'Em processo de doação',
      OnGoing: 'Enviado',
      Finished: 'Finalizado',
      Canceled: 'Cancelado',
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Available: 'status-available',
      OnGoing: 'status-ongoing',
      InProgress: 'status-inprogress',
      Finished: 'status-finished',
      Canceled: 'status-canceled',
    };
    return statusClasses[status] || '';
  }

  getTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      Desktop: 'Desktop',
      SmartPhone: 'Smartphone',
      Tablet: 'Tablet',
      Notebook: 'Notebook',
      Peripherals: 'Periféricos',
    };
    return typeLabels[type] || type;
  }
  formatDate(timestamp: number): string {
    return this.dateUtil.formatDate(timestamp);
  }
  formatDateTime(timestamp: number): string {
    return this.dateUtil.formatDateTime(timestamp);
  }

  get isReceptor(): boolean {
    const currentAccount = this.accountService.getAccountInfo();
    return currentAccount?.role === 'Receptor';
  }

  get isDonor(): boolean {
    const currentAccount = this.accountService.getAccountInfo();
    return currentAccount?.role === 'Donor';
  }

  retryLoadEquipment(): void {
    this.loadEquipment();
  }

  clearError(): void {
    this.error = '';
  }
}
