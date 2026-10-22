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
import { Donation, DonationStatus } from '../../models/donation.models';
import { catchError, of, finalize, forkJoin } from 'rxjs';
import { ToastContainerComponent } from '../../components/toast-container/toast-container.component';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-receptor-donation-detail',
  standalone: true,
  imports: [CommonModule, ToastContainerComponent, RouterLink],
  templateUrl: './receptor-donation-detail.component.html',
  styleUrls: ['./receptor-donation-detail.component.css'],
})
export class ReceptorDonationDetailComponent implements OnInit {
  donation: Donation | null = null;
  donorAccount: Account | null = null;
  equipments: Equipment[] = [];
  loading = true;
  isLoadingDonor = false;
  isLoadingEquipments = false;
  error = '';
  equipmentImages: Map<string, string> = new Map();

  private donationService = inject(DonationService);
  private accountService = inject(AccountService);
  private equipmentService = inject(EquipmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private errorService = inject(ErrorService);
  private dateUtil = inject(DateUtilService);
  private fileService = inject(FileService);

  ngOnInit(): void {
    this.loadDonation();
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
            this.loadDonationEquipments(
              data.equipments.map((eq) => eq.equipmentId)
            );
          }
        },
      });
  }

  private loadDonationEquipments(equipmentIds: string[]): void {
    if (!equipmentIds.length) return;

    this.isLoadingEquipments = true;
    const equipmentObservables = equipmentIds.map((id) =>
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
          this.equipments = equipments.filter(
            (equipment) => equipment !== null
          );
          if (this.equipments.length > 0) {
            this.loadDonorInfo(this.equipments[0].donorAccountId);
          }
          this.loadEquipmentImages();
        },
      });
  }

  private loadDonorInfo(donorAccountId: string): void {
    this.isLoadingDonor = true;
    this.accountService
      .getAccountById(donorAccountId)
      .pipe(
        catchError((error) => {
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

  loadEquipmentImages(): void {
    this.equipments.forEach((equipment) => {
      this.fileService
        .getEquipmentPictureUrl(equipment.id)
        .pipe(catchError(() => of(null)))
        .subscribe((response) => {
          if (response?.url) {
            this.equipmentImages.set(equipment.id, response.url);
          }
        });
    });
  }

  getEquipmentImageUrl(equipmentId: string): string | null {
    return this.equipmentImages.get(equipmentId) || null;
  }

  goBack(): void {
    this.router.navigate(['/receptor/donation']);
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

  get isReceptor(): boolean {
    const currentAccount = this.accountService.getAccountInfo();
    return currentAccount?.role === 'Receptor';
  }
}
