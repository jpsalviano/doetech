import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import { Account, CreateAccountRequest, UpdateAccountRequest, AccountQueryDto } from '../models/account.models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  readonly ACCOUNT_KEY = 'account_data';

  constructor(
    private http: HttpClient,
    private env: EnvironmentService
  ) {}

  createAccount(accountData: CreateAccountRequest): Observable<Account> {
    return this.http.post<Account>(this.env.accountEndpoints.base, accountData);
  }

  getAccountById(accountId: string): Observable<Account> {
    return this.http.get<Account>(this.env.accountEndpoints.getById(accountId));
  }

  getAccountByUserId(userId: string): Observable<Account> {
    return this.http.get<Account>(this.env.accountEndpoints.getByUserId(userId));
  }

  updateAccount(accountId: string, accountData: UpdateAccountRequest): Observable<Account> {
    return this.http.put<Account>(this.env.accountEndpoints.getById(accountId), accountData);
  }

  deleteAccount(accountId: string): Observable<void> {
    return this.http.delete<void>(this.env.accountEndpoints.delete(accountId));
  }

  queryAccounts(query: AccountQueryDto): Observable<Account[]> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            params = params.append(key, v);
          });
        } else {
          params = params.set(key, value as any);
        }
      }
    });
    return this.http.get<Account[]>(this.env.accountEndpoints.query, { params });
  }

  getAccountInfo(): Account | null {
    return this.getAcountFromStorage();
  }

  storeAccountData(account: Account): void {
    localStorage.setItem(this.ACCOUNT_KEY, JSON.stringify(account));
  }

  getAcountFromStorage(): Account | null {
    const accountJson = localStorage.getItem(this.ACCOUNT_KEY);
    return accountJson ? JSON.parse(accountJson) : null;
  }
}