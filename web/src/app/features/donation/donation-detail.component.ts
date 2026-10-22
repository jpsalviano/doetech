import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DonationService } from '../../services/donation.service';
import { AccountService } from '../../services/account.service';
import { EquipmentService } from '../../services/equipment.service';
import { ToastService } from '../../services/toast.service';
import { ErrorService } from '../../services/error.service';
import { DateUtilService } from '../../services/date-util.service';
import { Account } from '../../models/account.models';
import { Equipment } from '../../models/equipment.models';
import {
  Donation,
  DonationStatus,
} from '../../models/donation.models';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, of, finalize, forkJoin } from 'rxjs';
import { ToastContainerComponent } from '../../components/toast-container/toast-container.component';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-donation-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastContainerComponent, RouterLink],
  templateUrl: './donation-detail.component.html',
  styleUrls: ['./donation-detail.component.css'],
})
export class DonationDetailComponent implements OnInit {
  donation: Donation | null = null;
  recipientAccount: Account | null = null;
  equipments: Equipment[] = [];
  loading = true;
  isLoadingRecipient = false;
  isLoadingEquipments = false;
  error = '';
  statusForm!: FormGroup;
  isUpdatingStatus = false;
  equipmentImages: Map<string, string> = new Map();

  availableStatuses = [
    { value: DonationStatus.Approved, label: 'Aprovada' },
    { value: DonationStatus.InProgress, label: 'Em Andamento' },
    { value: DonationStatus.Finished, label: 'Finalizada' },
    { value: DonationStatus.Canceled, label: 'Cancelada' },
  ];

  private donationService = inject(DonationService);
  private accountService = inject(AccountService);
  private equipmentService = inject(EquipmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private errorService = inject(ErrorService);
  private dateUtil = inject(DateUtilService);
  private fileService = inject(FileService);

  ngOnInit(): void {
    this.initStatusForm();
    this.loadDonation();
  }

  initStatusForm(): void {
    this.statusForm = this.fb.group({
      status: ['', Validators.required],
    });
  }

  loadDonation(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID da doação não fornecido.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';
    this.donationService
      .getDonationById(id)
      .pipe(
        catchError((error) => {
          this.error = this.errorService.handleError(
            error,
            'Erro ao carregar doação. Tente novamente.'
          );
          this.toastService.error(this.error);
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (data) => {
          this.donation = data;
          if (data) {
            this.statusForm.patchValue({ status: data.status });
            this.loadRecipientInfo(data.recipientAccountId);
            this.loadDonationEquipments(data.equipments.map(eq => eq.equipmentId));
          }
        },
      });
  }

  private loadRecipientInfo(recipientAccountId: string): void {
    this.isLoadingRecipient = true;
    this.accountService
      .getAccountById(recipientAccountId)
      .pipe(
        catchError((error) => {
          return of(null);
        }),
        finalize(() => (this.isLoadingRecipient = false))
      )
      .subscribe({
        next: (account) => {
          this.recipientAccount = account;
        },
      });
  }

  private loadDonationEquipments(equipmentIds: string[]): void {
    if (!equipmentIds.length) return;

    this.isLoadingEquipments = true;
    const equipmentObservables = equipmentIds.map(id => 
      this.equipmentService.getEquipmentById(id).pipe(
        catchError((error) => {
          return of(null);
        })
      )
    );
    
    forkJoin(equipmentObservables)
    .pipe(finalize(() => (this.isLoadingEquipments = false)))
    .subscribe({
      next: (equipments) => {
        this.equipments = equipments.filter(equipment => equipment !== null);
        this.loadEquipmentImages();
      },
    });
  }

  loadEquipmentImages(): void {
    this.equipments.forEach(equipment => {
      this.fileService.getEquipmentPictureUrl(equipment.id)
        .pipe(
          catchError(() => of(null))
        )
        .subscribe(response => {
          if (response?.url) {
            this.equipmentImages.set(equipment.id, response.url);
          }
        });
    });
  }
  getEquipmentImageUrl(equipmentId: string): string | null {
    return this.equipmentImages.get(equipmentId) || null;
  }

  onUpdateStatus(): void {
    if (!this.donation || this.statusForm.invalid) return;

    const newStatus: DonationStatus = this.statusForm.value.status;

    this.isUpdatingStatus = true;
    this.error = '';
    this.donationService
      .updateDonationStatus(this.donation.id, newStatus)
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
          this.donation!.status = newStatus;
          this.statusForm.reset({
            status: newStatus,
          });
          this.toastService.success(
            'Status da doação atualizado com sucesso!'
          );
          
          this.loadDonation();
          
          if (
            newStatus === DonationStatus.Canceled ||
            newStatus === DonationStatus.Finished
          ) {
            setTimeout(() => {
              this.goBack();
            }, 1500);
          }
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/donor/donation']);
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      Pending: 'Pendente',
      Approved: 'Aprovada',
      InProgress: 'Em Andamento',
      Finished: 'Finalizada',
      Canceled: 'Cancelada',
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Pending: 'status-pending',
      Approved: 'status-approved',
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

  get isDonor(): boolean {
    const currentAccount = this.accountService.getAccountInfo();
    return currentAccount?.role === 'Donor';
  }

  get canUpdateStatus(): boolean {
    return this.donation?.status === DonationStatus.Pending || 
           this.donation?.status === DonationStatus.Approved ||
           this.donation?.status === DonationStatus.InProgress;
  }
}
