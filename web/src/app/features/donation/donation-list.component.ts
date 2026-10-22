import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DonationService } from '../../services/donation.service';
import { AccountService } from '../../services/account.service';
import { EquipmentService } from '../../services/equipment.service';
import { ToastService } from '../../services/toast.service';
import { ErrorService } from '../../services/error.service';
import {
  PaginationService,
  PaginationState,
  PaginationConfig,
} from '../../services/pagination.service';
import { Donation, DonationStatus, DonationQueryDto } from '../../models/donation.models';
import { Equipment } from '../../models/equipment.models';
import { Account } from '../../models/account.models';
import { catchError, of, finalize, forkJoin, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-donation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './donation-list.component.html',
  styleUrls: ['./donation-list.component.css'],
})
export class DonationListComponent implements OnInit, OnDestroy {
  paginationState: PaginationState<Donation>;
  paginationConfig: PaginationConfig = {
    pageSize: 10,
  };
  error = '';
  equipmentsByDonation: Map<string, Equipment[]> = new Map();
  recipientAccounts: Map<string, Account> = new Map();
  private destroy$ = new Subject<void>();

  private donationService = inject(DonationService);
  private accountService = inject(AccountService);
  private equipmentService = inject(EquipmentService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private errorService = inject(ErrorService);
  private paginationService = inject(PaginationService);

  constructor() {
    this.paginationState =
      this.paginationService.createPaginationState<Donation>(
        this.paginationConfig
      );
  }

  get donations(): Donation[] {
    return this.paginationState.items;
  }

  get loading(): boolean {
    return this.paginationState.loading;
  }

  get hasMoreItems(): boolean {
    return this.paginationState.hasMoreItems;
  }

  ngOnInit(): void {
    this.loadDonations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDonations(): void {
    const currentAccount = this.accountService.getAccountInfo();

    if (!currentAccount?.id) {
      this.error = 'Não foi possível obter informações da conta. Faça login novamente.';
      this.paginationState.loading = false;
      return;
    }

    this.paginationState.loading = true;
    this.error = '';

    const queryParams: DonationQueryDto = {
      donorAccountId: currentAccount.id,
      page: this.paginationState.currentPage,
      pageSize: this.paginationConfig.pageSize,
    };

    this.donationService
      .queryDonations(queryParams)
      .pipe(
        catchError((error) => {
          this.error = this.errorService.handleError(
            error,
            'Erro ao carregar suas doações. Tente novamente.'
          );
          this.toastService.error(this.error);
          return of([]);
        }),
        finalize(() => (this.paginationState.loading = false))
      )
      .subscribe({
        next: (donations) => {
          const sortedDonations = this.sortDonationsByStatus(donations);
          this.paginationService.updateItems(
            this.paginationState,
            sortedDonations,
            this.paginationConfig.pageSize,
            this.paginationState.currentPage === 1
          );
          this.loadDonationDetails(sortedDonations);
        },
      });
  }

  private loadDonationDetails(donations: Donation[]): void {
    if (donations.length === 0) return;
    const equipmentIds = [...new Set(
      donations.flatMap(d => d.equipments.map(de => de.equipmentId))
    )];
    const recipientIds = [...new Set(donations.map(d => d.recipientAccountId))];
    forkJoin({
      equipments: equipmentIds.length > 0 
        ? this.equipmentService.getEquipmentsByIds(equipmentIds)
        : of([]),
      recipients: recipientIds.length > 0 
        ? this.accountService.queryAccounts({ accountIds: recipientIds })
        : of([])
    }).pipe(
      catchError((error) => {
        return of({ equipments: [], recipients: [] });
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ equipments, recipients }) => {
        donations.forEach(donation => {
          const donationEquipments = equipments.filter(eq => 
            donation.equipments.some(de => de.equipmentId === eq.id)
          );
          this.equipmentsByDonation.set(donation.id, donationEquipments);
        });
        recipients.forEach(account => {
          if (account.id) {
            this.recipientAccounts.set(account.id, account);
          }
        });
      }
    });
  }

  private sortDonationsByStatus(donations: Donation[]): Donation[] {
    const statusPriority = {
      [DonationStatus.Pending]: 1,
      [DonationStatus.Approved]: 2,
      [DonationStatus.InProgress]: 3,
      [DonationStatus.Finished]: 4,
      [DonationStatus.Canceled]: 5,
    };
    return donations.sort((a, b) => {
      const priorityA = statusPriority[a.status] || 999;
      const priorityB = statusPriority[b.status] || 999;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return b.createdAt - a.createdAt;
    });
  }

  refreshDonations(): void {
    this.paginationService.reset(this.paginationState, true);
    this.equipmentsByDonation.clear();
    this.recipientAccounts.clear();
    this.loadDonations();
  }

  viewDonation(donationId: string): void {
    this.router.navigate(['/donor/donation', donationId]);
  }

  getDonationEquipments(donationId: string): Equipment[] {
    return this.equipmentsByDonation.get(donationId) || [];
  }

  getRecipientInfo(recipientAccountId: string): Account | null {
    return this.recipientAccounts.get(recipientAccountId) || null;
  }

  getStatusLabel(status: DonationStatus): string {
    const statusLabels = {
      [DonationStatus.Pending]: 'Pendente',
      [DonationStatus.Approved]: 'Aprovada',
      [DonationStatus.InProgress]: 'Em andamento',
      [DonationStatus.Finished]: 'Finalizada',
      [DonationStatus.Canceled]: 'Cancelada',
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: DonationStatus): string {
    const statusClasses = {
      [DonationStatus.Pending]: 'status-pending',
      [DonationStatus.Approved]: 'status-approved',
      [DonationStatus.InProgress]: 'status-ongoing',
      [DonationStatus.Finished]: 'status-finished',
      [DonationStatus.Canceled]: 'status-canceled',
    };
    return statusClasses[status] || '';
  }

  getEquipmentTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      Desktop: 'Desktop',
      SmartPhone: 'Smartphone',
      Tablet: 'Tablet',
      Notebook: 'Notebook',
      Peripherals: 'Periféricos',
    };
    return types[type] || type;
  }

  formatDate(timestamp: number): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('pt-BR');
  }

  getTotalEquipments(donationId: string): number {
    return this.getDonationEquipments(donationId).length;
  }

  loadMoreDonations(): void {
    if (!this.hasMoreItems || this.loading) return;

    const currentAccount = this.accountService.getAccountInfo();
    if (!currentAccount?.id) return;

    const scrollPosition = window.pageYOffset;
    this.paginationState.currentPage++;
    this.paginationState.loading = true;
    this.error = '';

    const queryParams: DonationQueryDto = {
      donorAccountId: currentAccount.id,
      page: this.paginationState.currentPage,
      pageSize: this.paginationConfig.pageSize,
    };

    this.donationService
      .queryDonations(queryParams)
      .pipe(
        catchError((error) => {
          this.error = this.errorService.handleError(
            error,
            'Erro ao carregar mais doações. Tente novamente.'
          );
          this.toastService.error(this.error);
          return of([]);
        }),
        finalize(() => (this.paginationState.loading = false))
      )
      .subscribe({
        next: (donations) => {
          const sortedDonations = this.sortDonationsByStatus(donations);
          this.paginationService.updateItems(
            this.paginationState,
            sortedDonations,
            this.paginationConfig.pageSize,
            false
          );
          this.loadDonationDetails(sortedDonations);
          setTimeout(() => {
            window.scrollTo(0, scrollPosition);
          }, 0);
        },
      });
  }
}
