import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { map, catchError, of } from 'rxjs';

export function createUserGuard(requiredRole: 'Donor' | 'Receptor'): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const accountService = inject(AccountService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const user = authService.getUserInfo();
    if (!user?.id) {
      router.navigate(['/login']);
      return false;
    }

    if (user.isAdmin) {
      router.navigate(['/admin']);
      return false;
    }

    const existingAccount = accountService.getAccountInfo();
    if (existingAccount) {
      if (existingAccount.role !== requiredRole) {
        router.navigate(['/not-found']);
        return false;
      }
      return true;
    }

    return accountService.getAccountByUserId(user.id).pipe(
      map(account => {
        if (!account) {
          router.navigate(['/register-incomplete']);
          return false;
        }

        accountService.storeAccountData(account);

        if (account.role !== requiredRole) {
          router.navigate(['/not-found']);
          return false;
        }

        return true;
      }),
      catchError(error => {
        if (error.status === 404) {
          router.navigate(['/register-incomplete']);
        } else {
          router.navigate(['/login']);
        }
        return of(false);
      })
    );
  };
}

export const donorGuard = createUserGuard('Donor');
export const receptorGuard = createUserGuard('Receptor');
