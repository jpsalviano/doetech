import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { AccountService } from '../../services/account.service';
import { ErrorService } from '../../services/error.service';
import { Notification, NotificationQueryDto } from '../../models/notification.models';
import { Account } from '../../models/account.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card">
        <h2>Todas as Notificações</h2>
        
        @if (loading) {
        <div class="loading">
          <p>Carregando notificações...</p>
        </div>
        } @else if (notifications.length === 0) {
        <div class="empty">
          <p>Nenhuma notificação encontrada</p>
        </div>
        } @else {
        <div class="notifications-list">
          @for (notification of notifications; track notification.id) {
          <div class="notification-item" [class.unread]="!notification.read">
            <div class="notification-header" (click)="toggleNotification(notification.id)">
              <h4>{{ notification.title }}</h4>
              <div class="notification-meta">
                <span class="notification-time">{{ formatDate(notification.createdAt) }}</span>
                @if (!notification.read) {
                <span class="unread-badge">Não lida</span>
                } @else {
                <span class="read-badge">Lida</span>
                }
              </div>
            </div>
            @if (expandedNotifications.has(notification.id)) {
            <div class="notification-content">
              <p>{{ notification.content }}</p>
            </div>
            }
          </div>
          }
        </div>
        
        @if (hasMorePages) {
        <div class="pagination">
          <button (click)="loadMore()" [disabled]="loading">
            Carregar mais
          </button>
        </div>
        }
        }
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 2rem;
    }
    
    h2 {
      margin-bottom: 1.5rem;
      color: #333;
    }
    
    .loading, .empty {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .notification-item {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .notification-item.unread {
      border-left: 4px solid #007bff;
      background-color: #f8f9fa;
    }
    
    .notification-header {
      padding: 1rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .notification-header:hover {
      background-color: #f5f5f5;
    }
    
    .notification-header h4 {
      margin: 0;
      color: #333;
    }
    
    .notification-meta {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    
    .notification-time {
      font-size: 0.875rem;
      color: #666;
    }
    
    .unread-badge {
      background-color: #dc3545;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    
    .read-badge {
      background-color: #28a745;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    
    .notification-content {
      padding: 0 1rem 1rem 1rem;
      border-top: 1px solid #e0e0e0;
      background-color: #f9f9f9;
    }
    
    .notification-content p {
      margin: 0.5rem 0 0 0;
      color: #555;
      line-height: 1.5;
    }
    
    .pagination {
      text-align: center;
      margin-top: 2rem;
    }
    
    .pagination button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .pagination button:hover:not(:disabled) {
      background-color: #0056b3;
    }
    
    .pagination button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class NotificationsListComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  hasMorePages = true;
  currentAccount: Account | null = null;
  expandedNotifications = new Set<string>();
  private destroy$ = new Subject<void>();

  private notificationService = inject(NotificationService);
  private accountService = inject(AccountService);
  private errorService = inject(ErrorService);

  ngOnInit(): void {
    this.currentAccount = this.accountService.getAccountInfo();
    if (this.currentAccount) {
      this.loadNotifications();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNotifications(): void {
    if (!this.currentAccount) return;

    this.loading = true;
    const query: NotificationQueryDto = {
      accountId: this.currentAccount.id,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.notificationService.queryNotifications(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          if (this.currentPage === 1) {
            this.notifications = notifications;
          } else {
            this.notifications = [...this.notifications, ...notifications];
          }
          
          this.hasMorePages = notifications.length === this.pageSize;
          this.loading = false;
        },
        error: (error) => {
          const errorMessage = this.errorService.handleError(error, 'Erro ao carregar notificações');
          console.error('Error loading notifications:', errorMessage);
          this.loading = false;
        }
      });
  }

  loadMore(): void {
    if (!this.hasMorePages || this.loading) return;
    
    this.currentPage++;
    this.loadNotifications();
  }

  toggleNotification(notificationId: string): void {
    if (this.expandedNotifications.has(notificationId)) {
      this.expandedNotifications.delete(notificationId);
    } else {
      this.expandedNotifications.add(notificationId);
    }
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
