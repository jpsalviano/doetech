import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DonationService } from '../../services/donation.service';
import { EquipmentService } from '../../services/equipment.service';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ErrorService } from '../../services/error.service';
import { DonationCart } from '../../models/donation.models';
import { Equipment } from '../../models/equipment.models';
import { Account } from '../../models/account.models';
import { User } from '../../models/user.models';
import { catchError, of, finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-donation-create',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donation-create.component.html',
  styleUrls: ['./donation-create.component.css'],
})
export class DonationCreateComponent implements OnInit, OnDestroy {
  donationCart: DonationCart | null = null;
  currentUser: User | null = null;
  currentAccount: Account | null = null;
  equipments: Equipment[] = [];
  donorAccount: Account | null = null;
  isSubmitting = false;
  isLoadingEquipments = false;
  error = '';
  private destroy$ = new Subject<void>();

  private donationService = inject(DonationService);
  private equipmentService = inject(EquipmentService);
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private errorService = inject(ErrorService);

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadCurrentAccount();
    this.loadDonationCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/auth']);
      }
    });
  }
  private loadCurrentAccount(): void {
    this.currentAccount = this.accountService.getAccountInfo();
  }

  private loadDonationCart(): void {
    this.donationService.donationCart$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cart) => {
        this.donationCart = cart;
        if (!cart || cart.selectedEquipments.length === 0) {
          this.equipments = [];
        } else {
          this.loadEquipmentDetails();
        }
      });
  }

  private loadEquipmentDetails(): void {
    if (
      !this.donationCart ||
      this.donationCart.selectedEquipments.length === 0
    ) {
      return;
    }

    this.isLoadingEquipments = true;
    const equipmentIds = this.donationCart.selectedEquipments.map(
      (eq) => eq.id
    );

    this.equipmentService
      .getEquipmentsByIds(equipmentIds)
      .pipe(
        finalize(() => (this.isLoadingEquipments = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (equipments) => {
          this.equipments = equipments;

          if (this.equipments.length !== equipmentIds.length) {
            this.toastService.warning(
              'Alguns equipamentos não puderam ser carregados'
            );
          }

          if (this.equipments.length > 0 && this.donationCart) {
            this.loadDonorInfo(this.donationCart.donorAccountId);
          }
        },
        error: (error) => {
          this.toastService.error('Erro ao carregar detalhes dos equipamentos');
          this.router.navigate(['/browse']);
        },
      });
  }

  private loadDonorInfo(donorAccountId: string): void {
    this.accountService
      .getAccountById(donorAccountId)
      .pipe(
        catchError((error) => {
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (account) => {
          this.donorAccount = account;
        },
      });
  }

  get selectedEquipments(): Equipment[] {
    return this.equipments;
  }

  get totalItems(): number {
    return this.equipments.length;
  }
  onSubmitDonation(): void {
    if (!this.currentAccount || !this.donationCart) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    this.donationService
      .createDonationFromCart(this.currentAccount.id!)
      .pipe(
        catchError((error) => {
          this.error = this.errorService.handleError(
            error,
            'Erro ao criar solicitação de doação. Tente novamente.'
          );
          this.toastService.error(this.error);
          return of(null);
        }),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: (donation) => {
          if (donation) {
            this.toastService.success(
              'Solicitação de doação criada com sucesso!'
            );
            this.donationService.clearDonationCart();
            this.router.navigate(['/donation/success', donation.id]);
          }
        },
      });
  }

  onRemoveEquipment(equipmentId: string): void {
    this.donationService.removeEquipmentFromCart(equipmentId);
    this.equipments = this.equipments.filter((eq) => eq.id !== equipmentId);
  }

  onCancel(): void {
    this.router.navigate(['/browse/equipment']);
  }

  onClearAll(): void {
    this.donationService.clearDonationCart();
    this.toastService.info('Seleção limpa');
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
}
