import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { Notification } from '../../models/notification.models';
import { Account } from '../../models/account.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  unreadNotifications: Notification[] = [];
  hasUnreadNotifications = false;
  isOpen = false;
  loading = false;
  currentAccount: Account | null = null;
  private destroy$ = new Subject<void>();

  private notificationService = inject(NotificationService);
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.currentAccount = this.accountService.getAccountInfo();
    if (this.currentAccount) {
      this.notificationService.startPolling(this.currentAccount.id!);
    }

    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        const newAccount = this.accountService.getAccountInfo();
        
        if (newAccount && (!this.currentAccount || newAccount.id !== this.currentAccount.id)) {
          this.currentAccount = newAccount;
          this.notificationService.startPolling(this.currentAccount.id!);
        } else if (!newAccount && this.currentAccount) {
          this.currentAccount = null;
          this.unreadNotifications = [];
          this.hasUnreadNotifications = false;
          this.notificationService.stopPolling();
        }
      });

    this.notificationService.hasUnreadNotifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(hasUnread => {
        this.hasUnreadNotifications = hasUnread;
        if (hasUnread && this.currentAccount) {
          this.loadUnreadNotifications();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.notificationService.stopPolling();
  }

  private loadUnreadNotifications(): void {
    if (!this.currentAccount) return;

    this.loading = true;
    this.notificationService.getUnreadNotifications(this.currentAccount.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.unreadNotifications = notifications.sort((a, b) => b.createdAt - a.createdAt);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading unread notifications:', error);
          this.loading = false;
        }
      });
  }

  toggleDropdown(): void {
    if (!this.isOpen && this.hasUnreadNotifications) {
      this.loadUnreadNotifications();
    }
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  markNotificationAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notificationId);
          if (this.currentAccount) {
            this.notificationService.refreshUnreadCount(this.currentAccount.id!);
          }
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
  }

  markAllAsRead(): void {
    if (!this.currentAccount) return;

    this.notificationService.markAllAsRead(this.currentAccount.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.unreadNotifications = [];
          this.hasUnreadNotifications = false;
        },
        error: (error) => {
          console.error('Error marking all notifications as read:', error);
        }
      });
  }

  goToNotificationsList(): void {
    this.router.navigate(['/notifications']);
    this.closeDropdown();
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
}
