import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { DonationService } from '../services/donation.service';
import { ErrorService } from '../services/error.service';
import { ToastService } from '../services/toast.service';
import { DateUtilService } from '../services/date-util.service';
import { ToastContainerComponent } from '../components/toast-container/toast-container.component';
import { User } from '../models/user.models';
import { Account } from '../models/account.models';
import { Donation, DonationStatus } from '../models/donation.models';
import { catchError, of, forkJoin, map } from 'rxjs';

interface UserWithAccount {
  user: User;
  account: Account | null;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ToastContainerComponent
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  usersWithAccounts: UserWithAccount[] = [];
  donations: Donation[] = [];
  isLoadingUsers = false;
  isLoadingDonations = false;
  activeTab: 'users' | 'donations' = 'users';

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private donationService: DonationService,
    private errorService: ErrorService,
    private toastService: ToastService,
    private dateUtilService: DateUtilService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  setActiveTab(tab: 'users' | 'donations'): void {
    this.activeTab = tab;
    if (tab === 'donations' && this.donations.length === 0) {
      this.loadDonations();
    }
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.authService.queryUsers({}).pipe(
      catchError((error) => {
        this.toastService.error(this.errorService.handleError(error, 'Erro ao carregar usuários'));
        return of([]);
      })
    ).subscribe({
      next: (users) => {
        this.loadAccountsForUsers(users);
      }
    });
  }

  loadAccountsForUsers(users: User[]): void {
    const accountObservables = users.map(user => {
      if (user.isAdmin) {
        return of({ user, account: null });
      } else {
        return this.accountService.getAccountByUserId(user.id).pipe(
          catchError(() => of(null)),
          map(account => ({ user, account }))
        );
      }
    });

    forkJoin(accountObservables).subscribe({
      next: (usersWithAccounts) => {
        this.usersWithAccounts = usersWithAccounts;
        this.isLoadingUsers = false;
      },
      error: () => {
        this.isLoadingUsers = false;
      }
    });
  }

  loadDonations(): void {
    this.isLoadingDonations = true;
    this.donationService.queryDonations({}).pipe(
      catchError((error) => {
        this.toastService.error(this.errorService.handleError(error, 'Erro ao carregar doações'));
        return of([]);
      })
    ).subscribe({
      next: (donations) => {
        this.donations = donations.sort((a, b) => b.createdAt - a.createdAt);
        this.isLoadingDonations = false;
      }
    });
  }

  getUserDisplayName(userWithAccount: UserWithAccount): string {
    if (userWithAccount.account?.name) return userWithAccount.account.name;
    if (userWithAccount.account?.businessName) return userWithAccount.account.businessName;
    return userWithAccount.user.email;
  }

  getUserRole(userWithAccount: UserWithAccount): string {
    if (userWithAccount.user.isAdmin) return 'Administrador';
    if (userWithAccount.account?.role === 'Donor') return 'Doador';
    if (userWithAccount.account?.role === 'Receptor') return 'Receptor';
    return 'Sem conta';
  }

  getUserDocument(userWithAccount: UserWithAccount): string {
    if (!userWithAccount.account) return '-';
    if (userWithAccount.account.cpf) return `CPF: ${this.formatCpf(userWithAccount.account.cpf)}`;
    if (userWithAccount.account.cnpj) return `CNPJ: ${this.formatCnpj(userWithAccount.account.cnpj)}`;
    return '-';
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

  formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatCnpj(cnpj: string): string {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  formatDate(timestamp?: number): string {
    return this.dateUtilService.formatDate(timestamp || 0);
  }

  formatDateTime(timestamp?: number): string {
    return this.dateUtilService.formatDateTime(timestamp || 0);
  }
}
