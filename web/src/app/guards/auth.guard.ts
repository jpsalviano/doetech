import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/not-found']);
    return false;
  }

  if (authService.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }

  if (!accountService.getAccountInfo()) {
    router.navigate(['/register-incomplete']);
    return false;
  }
  
  return true;
};