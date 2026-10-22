import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { DonationService } from '../../services/donation.service';
import { AccountService } from '../../services/account.service';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../services/toast.service';
import { ErrorService } from '../../services/error.service';
import {
  PaginationService,
  PaginationState,
  PaginationConfig,
} from '../../services/pagination.service';
import { Equipment, EquipmentQueryDto } from '../../models/equipment.models';
import { DonationCart } from '../../models/donation.models';
import { Account } from '../../models/account.models';
import { catchError, of, finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-equipment-browse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipment-browse.component.html',
  styleUrls: ['./equipment-browse.component.css'],
})
export class EquipmentBrowseComponent implements OnInit, OnDestroy {
  paginationState: PaginationState<Equipment>;
  paginationConfig: PaginationConfig = {
    pageSize: 12,
  };
  error = '';
  donationCart: DonationCart | null = null;
  donorAccounts: Map<string, Account> = new Map();
  equipmentImages: Map<string, string> = new Map();
  private destroy$ = new Subject<void>();

  private equipmentService = inject(EquipmentService);
  private donationService = inject(DonationService);
  private accountService = inject(AccountService);
  private fileService = inject(FileService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private errorService = inject(ErrorService);
  private paginationService = inject(PaginationService);

  constructor() {
    this.paginationState =
      this.paginationService.createPaginationState<Equipment>(
        this.paginationConfig
      );
  }

  get equipments(): Equipment[] {
    return this.paginationState.items;
  }

  get loading(): boolean {
    return this.paginationState.loading;
  }

  get hasMoreItems(): boolean {
    return this.paginationState.hasMoreItems;
  }
  ngOnInit(): void {
    this.subscribeToDonationCart();
    this.loadAvailableEquipments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToDonationCart(): void {
    this.donationService.donationCart$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cart) => {
        this.donationCart = cart;
      });
  }

  loadAvailableEquipments(): void {
    this.paginationState.loading = true;
    this.error = '';

    const queryParams: EquipmentQueryDto = {
      page: this.paginationState.currentPage,
      pageSize: this.paginationConfig.pageSize,
    };

    this.equipmentService
      .queryEquipments(queryParams)
      .pipe(
        catchError((error) => {
          this.error = this.errorService.handleError(
            error,
            'Erro ao carregar equipamentos disponíveis. Tente novamente.'
          );
          this.toastService.error(this.error);
          return of([]);
        }),
        finalize(() => (this.paginationState.loading = false))
      )
      .subscribe({
        next: (data) => {
          const availableEquipments = data.filter(
            (equipment) =>
              equipment.status === 'Available' && !equipment.removed
          );

          this.paginationService.updateItems(
            this.paginationState,
            availableEquipments,
            this.paginationConfig.pageSize,
            this.paginationState.currentPage === 1
          );

          this.loadDonorAccountsForEquipments(availableEquipments);
          this.loadEquipmentImages();
        },
      });
  }

  private loadDonorAccountsForEquipments(equipments: Equipment[]): void {
    const donorIds = [...new Set(equipments.map((eq) => eq.donorAccountId))];
    const missingDonorIds = donorIds.filter((id) => !this.donorAccounts.has(id));
    if (missingDonorIds.length === 0) return;
    this.accountService
      .queryAccounts({ accountIds: missingDonorIds })
      .pipe(
        catchError((error) => {
          return of([]);
        })
      )
      .subscribe((accounts) => {
        accounts.forEach((account) => {
          if (account.id) {
            this.donorAccounts.set(account.id, account);
          }
        });
      });
  }

  getDonorInfo(donorAccountId: string): Account | null {
    return this.donorAccounts.get(donorAccountId) || null;
  }

  loadMoreEquipments(): void {
    if (!this.hasMoreItems || this.loading) return;

    const scrollPosition = window.pageYOffset;
    this.paginationState.currentPage++;

    this.equipmentService
      .queryEquipments({
        page: this.paginationState.currentPage,
        pageSize: this.paginationConfig.pageSize,
      })
      .pipe(
        catchError((error) => {
          this.toastService.error('Erro ao carregar mais equipamentos.');
          return of([]);
        }),
        finalize(() => (this.paginationState.loading = false))
      )
      .subscribe({
        next: (data) => {
          const availableEquipments = data.filter(
            (equipment) =>
              equipment.status === 'Available' && !equipment.removed
          );

          this.paginationService.updateItems(
            this.paginationState,
            availableEquipments,
            this.paginationConfig.pageSize,
            false
          );

          this.loadDonorAccountsForEquipments(availableEquipments);

          setTimeout(() => {
            window.scrollTo(0, scrollPosition);
          }, 0);
        },
      });
  }

  refreshEquipments(): void {
    this.paginationService.reset(this.paginationState, true);
    this.loadAvailableEquipments();
  }

  viewEquipment(equipmentId: string): void {
    this.router.navigate(['/browse/equipment', equipmentId]);
  }

  toggleEquipmentSelection(equipment: Equipment, event: Event): void {
    event.stopPropagation();

    if (this.isEquipmentSelected(equipment.id)) {
      this.removeFromSelection(equipment.id);
    } else {
      this.addToSelection(equipment);
    }
  }

  addToSelection(equipment: Equipment): void {
    const success = this.donationService.addEquipmentToCart(equipment);

    if (!success) {
      this.toastService.error(
        'Você só pode selecionar equipamentos do mesmo doador. Limpe a seleção atual ou escolha equipamentos do mesmo doador.'
      );
      return;
    }

    this.toastService.success(
      `${this.getEquipmentTypeLabel(equipment.type)} adicionado à seleção`
    );
  }

  removeFromSelection(equipmentId: string): void {
    this.donationService.removeEquipmentFromCart(equipmentId);
    this.toastService.info('Equipamento removido da seleção');
  }

  isEquipmentSelected(equipmentId: string): boolean {
    return this.donationService.isEquipmentInCart(equipmentId);
  }

  canSelectEquipment(equipment: Equipment): boolean {
    return this.donationService.canSelectEquipment(equipment);
  }

  getSelectedCount(): number {
    return this.donationService.getCartItemCount();
  }

  clearSelection(): void {
    this.donationService.clearDonationCart();
    this.toastService.info('Seleção limpa');
  }

  proceedToDonation(): void {
    if (this.getSelectedCount() === 0) {
      this.toastService.error(
        'Selecione pelo menos um equipamento para continuar'
      );
      return;
    }

    this.router.navigate(['/donation/create']);
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
}
