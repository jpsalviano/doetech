import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AccountService } from '../../../services/account.service';
import { NotificationComponent } from '../../notification/notification.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  // No celular os links ficam atrás de um botão de menu.
  menuOpen = false;
  private authService = inject(AuthService);
  private accountService = inject(AccountService);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn() && !this.authService.isAdmin();
  }

  get equipmentRoute(): string {
    const accountInfo = this.accountService.getAccountInfo();
    if (accountInfo?.role === 'Donor') {
      return '/donor/equipment';
    } else if (accountInfo?.role === 'Receptor') {
      return '/browse/equipment';
    }
    return '/profile';
  }

  get isDonor(): boolean {
    const accountInfo = this.accountService.getAccountInfo();
    return accountInfo?.role === 'Donor';
  }

  get isReceptor(): boolean {
    const accountInfo = this.accountService.getAccountInfo();
    return accountInfo?.role === 'Receptor';
  }

  get showDonationList(): boolean {
    return this.isDonor || this.isReceptor;
  }

  get donationListRoute(): string {
    const accountInfo = this.accountService.getAccountInfo();
    if (accountInfo?.role === 'Donor') {
      return '/donor/donation';
    } else if (accountInfo?.role === 'Receptor') {
      return '/receptor/donation';
    }
    return '/profile';
  }

  get donationListTitle(): string {
    const accountInfo = this.accountService.getAccountInfo();
    if (accountInfo?.role === 'Donor') {
      return 'Minhas Doações';
    } else if (accountInfo?.role === 'Receptor') {
      return 'Doações Recebidas';
    }
    return 'Doações';
  }

  logout(): void {
    this.authService.logout();
  }
}
