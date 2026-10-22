import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { EnvironmentService } from './environment.service';
import { AccountService } from './account.service';
import { User, LoginRequest, UserQueryDto, CreateUserRequest, UpdateUserRequest, LoginResponse } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private env: EnvironmentService,
    private accountService: AccountService
  ) {
    this.checkTokenExpiry();
  }

  private checkTokenExpiry(): void {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      this.logout();
    }
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.env.userEndpoints.base}/${userId}`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  register(userData: CreateUserRequest): Observable<User> {
    const payload = {
      ...userData,
      isAdmin: userData.isAdmin !== undefined ? userData.isAdmin : false
    };
    
    return this.http.post<User>(this.env.userEndpoints.base, payload).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.env.userEndpoints.login, credentials).pipe(
      catchError(error => {
        return throwError(() => error);
      }),
      tap(response => {
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          isAdmin: response.user.isAdmin || false,
          createdAt: response.user.createdAt,
          token: response.token,
        };
        
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
        
        this.storeUserData(userData);
        this.userSubject.next(userData);
      })
    );
  }

  recoverPassword(email: string): Observable<any> {
    return this.http.post(this.env.userEndpoints.recover, { email }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  queryUsers(queryParams: UserQueryDto): Observable<User[]> {
    const params = Object.entries(queryParams)
      .filter(([_, value]) => value !== undefined && value !== null)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);
      
    return this.http.get<User[]>(`${this.env.userEndpoints.base}/query`, { params }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  updateUser(userId: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.env.userEndpoints.base}/${userId}`, userData).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.env.userEndpoints.base}/${userId}`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  refreshCurrentUser(): Observable<User | null> {
    const currentUser = this.getUserInfo();
    if (!currentUser?.id) {
      return of(null);
    }
    
    return this.getUserById(currentUser.id).pipe(
      tap(user => {
        const updatedUser = { ...user, token: currentUser.token };
        this.storeUserData(updatedUser);
        this.userSubject.next(updatedUser);
      }),
      catchError(error => {
        if (error.status === 401 || error.status === 404) {
          this.logout();
        }
        return of(null);
      })
    );
  }

  updateCurrentUser(userData: UpdateUserRequest): Observable<User> {
    const currentUser = this.getUserInfo();
    if (!currentUser?.id) {
      return throwError(() => new Error('No user logged in'));
    }
    
    return this.updateUser(currentUser.id, userData).pipe(
      tap(updatedUser => {
        const userWithToken = { ...updatedUser, token: currentUser.token };
        this.storeUserData(userWithToken);
        this.userSubject.next(userWithToken);
      })
    );
  }
  navigateAfterLogin(): void {
    const user = this.getUserInfo();
    if (!user?.id) {
      this.router.navigate(['/']);
      return;
    }

    if (user.isAdmin) {
      this.router.navigate(['/admin']);
      return;
    }

    const existingAccount = this.accountService.getAccountInfo();
    if (existingAccount) {
      this.router.navigate(['/profile']);
      return;
    }

    this.accountService.getAccountByUserId(user.id).pipe(
      catchError(() => of(null))
    ).subscribe(account => {
      if (account) {
        this.accountService.storeAccountData(account);
        this.router.navigate(['/profile']);
      } else {
        this.router.navigate(['/register-incomplete']);
      }
    });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.accountService.ACCOUNT_KEY);
    
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  validateSession(): Observable<boolean> {
    const currentUser = this.getUserInfo();
    if (!currentUser?.id) {
      return of(false);
    }
    
    return this.getUserById(currentUser.id).pipe(
      map(() => true),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          this.logout();
        }
        return of(false);
      })
    );
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      this.logout();
      return false;
    }
    
    return true;
  }

  isAdmin(): boolean {
    const user = this.getUserInfo();
    return user?.isAdmin === true;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserInfo(): User | null {
    return this.getUserFromStorage();
  }

  private storeUserData(user: User): void {
    const safeUserData = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    };
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(safeUserData));
    
    if (user.token) {
      localStorage.setItem(this.TOKEN_KEY, user.token);
    }
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    
    const userData = JSON.parse(userJson);
    const token = this.getToken();
    
    return token ? { ...userData, token } : userData;
  }
}
