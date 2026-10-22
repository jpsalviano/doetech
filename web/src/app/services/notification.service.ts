import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';
import { ErrorService } from './error.service';
import {
  Notification,
  NotificationQueryDto
} from '../models/notification.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);
  private errorService = inject(ErrorService);

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  getNotificationById(notificationId: string): Observable<Notification> {
    return this.http.get<Notification>(
      this.environmentService.notificationEndpoints.getById(notificationId)
    ).pipe(
      catchError(error => {
        const errorMessage = this.errorService.handleError(error, 'Erro ao buscar notificação');
        console.error('Error getting notification:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.post<void>(
      this.environmentService.notificationEndpoints.markAsRead(notificationId),
      {}
    ).pipe(
      tap(() => {
        const currentCount = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, currentCount - 1));
      }),
      catchError(error => {
        const errorMessage = this.errorService.handleError(error, 'Erro ao marcar notificação como lida');
        console.error('Error marking notification as read:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getAllByAccount(accountId: string): Observable<Notification[]> {
    const url = this.environmentService.notificationEndpoints.getAllByAccount(accountId);
    
    return this.http.get<Notification[]>(url).pipe(
      catchError(error => {
        const errorMessage = this.errorService.handleError(error, 'Erro ao buscar notificações');
        console.error('Error getting notifications:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  queryNotifications(query: NotificationQueryDto): Observable<Notification[]> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<Notification[]>(
      this.environmentService.notificationEndpoints.query,
      { params }
    ).pipe(
      catchError(error => {
        const errorMessage = this.errorService.handleError(error, 'Erro ao buscar notificações');
        console.error('Error querying notifications:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(
      this.environmentService.notificationEndpoints.delete(notificationId)
    );
  }

  getUnreadNotifications(accountId: string): Observable<Notification[]> {
    const query: NotificationQueryDto = {
      accountId,
      read: false,
      pageSize: 50
    };
    return this.queryNotifications(query);
  }

  refreshUnreadCount(accountId?: string): void {
    if (!accountId) {
      console.log('No account ID provided, setting unread count to 0');
      this.unreadCountSubject.next(0);
      return;
    }
    
    console.log('Refreshing unread count for account:', accountId);
    this.getUnreadNotifications(accountId).subscribe({
      next: (notifications) => {
        console.log('Unread notifications found:', notifications.length);
        this.unreadCountSubject.next(notifications.length);
      },
      error: (error) => {
        console.error('Error refreshing unread count:', error);
        this.unreadCountSubject.next(0);
      }
    });
  }

  markAllAsRead(accountId: string): Observable<void> {
    return new Observable(observer => {
      this.getUnreadNotifications(accountId).subscribe({
        next: (notifications) => {
          if (notifications.length === 0) {
            observer.next();
            observer.complete();
            return;
          }

          let completed = 0;
          notifications.forEach(notification => {
            this.markAsRead(notification.id).subscribe({
              next: () => {
                completed++;
                if (completed === notifications.length) {
                  observer.next();
                  observer.complete();
                }
              },
              error: (error) => observer.error(error)
            });
          });
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
