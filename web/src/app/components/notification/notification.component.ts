import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { Notification } from '../../models/notification.models';
import { Account } from '../../models/account.models';
import { Subject, takeUntil, interval } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isOpen = false;
  loading = false;
  private currentAccount: Account | null = null;
  private destroy$ = new Subject<void>();

  private notificationService = inject(NotificationService);
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  ngOnInit(): void {
    this.initializeNotifications();
    this.setupAuthListener();
    this.setupUnreadCountListener();
    this.setupPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeNotifications(): void {
    this.currentAccount = this.accountService.getAccountInfo();
    if (this.currentAccount) {
      this.loadUnreadNotifications();
    }
  }

  private setupAuthListener(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.checkAndLoadNotifications();
      } else {
        this.resetNotifications();
      }
    });
  }

  private checkAndLoadNotifications(): void {
    const user = this.authService.getUserInfo();
    const newAccount = this.accountService.getAccountInfo();

    if (user && newAccount) {
      if (!this.currentAccount || newAccount.id !== this.currentAccount.id) {
        this.currentAccount = newAccount;
        this.loadUnreadNotifications();
      }
    } else if (user && !newAccount) {
      setTimeout(() => this.checkAndLoadNotifications(), 500);
    }
  }

  private setupUnreadCountListener(): void {
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.unreadCount = count;
      });
  }

  private setupPolling(): void {
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.currentAccount) {
          this.notificationService.refreshUnreadCount(this.currentAccount.id!);
        }
      });
  }

  private loadUnreadNotifications(): void {
    if (!this.currentAccount) return;

    this.notificationService.refreshUnreadCount(this.currentAccount.id!);
  }

  private loadRecentNotifications(): void {
    if (!this.currentAccount) return;

    this.loading = true;

    this.notificationService
      .getAllByAccount(this.currentAccount.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);
          this.loading = false;
        },
        error: (error) => {
          const errorMessage = this.errorService.handleError(
            error,
            'Erro ao carregar notificações'
          );
          console.error('Error loading notifications:', errorMessage);
          this.loading = false;
        },
      });
  }

  private resetNotifications(): void {
    this.currentAccount = null;
    this.notifications = [];
    this.unreadCount = 0;
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen && this.currentAccount) {
      this.loadRecentNotifications();
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.markNotificationAsRead(notification);
    }

    this.handleNotificationNavigation(notification);
  }

  private handleNotificationNavigation(notification: Notification): void {
    const donationIdMatch = notification.content.match(
      /\[donationId:([^\]]+)\]/
    );
    if (donationIdMatch) {
      const donationId = donationIdMatch[1];
      this.closeDropdown();
      this.router.navigate(['/donor/donation', donationId]);
    }
  }

  private markNotificationAsRead(notification: Notification): void {
    this.notificationService
      .markAsRead(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notification.read = true;
          if (this.currentAccount) {
            this.notificationService.refreshUnreadCount(
              this.currentAccount.id!
            );
          }
        },
        error: (error) => {
          const errorMessage = this.errorService.handleError(
            error,
            'Erro ao marcar notificação como lida'
          );
          console.error('Error marking notification as read:', errorMessage);
        },
      });
  }

  markAllAsRead(): void {
    if (!this.currentAccount) return;

    this.notificationService
      .markAllAsRead(this.currentAccount.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach((n) => (n.read = true));
          this.notificationService.refreshUnreadCount(this.currentAccount!.id!);
        },
        error: (error) => {
          const errorMessage = this.errorService.handleError(
            error,
            'Erro ao marcar todas como lidas'
          );
          console.error('Error marking all as read:', errorMessage);
        },
      });
  }

  viewAllNotifications(): void {
    this.closeDropdown();
    this.router.navigate(['/notifications']);
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString('pt-BR');
  }

  get shouldShowNotifications(): boolean {
    return this.authService.isLoggedIn();
  }

  get hasNotifications(): boolean {
    return this.notifications.length > 0;
  }

  getNotificationTitle(notification: Notification): string {
    return (
      notification.title || notification.content.split('.')[0] || 'Notificação'
    );
  }

  isClickableNotification(notification: Notification): boolean {
    return notification.content.includes('[donationId:');
  }
}
