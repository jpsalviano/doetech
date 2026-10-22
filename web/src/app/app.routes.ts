import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { donorGuard } from './guards/donor.guard';
import { receptorGuard } from './guards/receptor.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'landing',
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin-app/admin-app.component').then(m => m.AdminAppComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./admin-app/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'panel',
        loadComponent: () => import('./admin-app/admin-panel.component').then(m => m.AdminPanelComponent)
      },
    ]
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'solutions',
    loadComponent: () =>
      import('./pages/solutions/solutions.component').then(
        (m) => m.SolutionsComponent
      ),
  },
  {
    path: 'make-donation',
    loadComponent: () =>
      import('./pages/make-donation/make-donation.component').then(
        (m) => m.MakeDonationComponent
      ),
  },
  {
    path: 'receive-donation',
    loadComponent: () =>
      import('./pages/receive-donation/receive-donation.component').then(
        (m) => m.ReceiveDonationComponent
      ),
  },
  {
    path: 'how-it-works',
    loadComponent: () =>
      import('./pages/how-it-works/how-it-works.component').then(
        (m) => m.HowItWorksComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'register-incomplete',
    loadComponent: () =>
      import(
        './features/auth/register-incomplete/register-incomplete.component'
      ).then((m) => m.RegisterIncompleteComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'recover-password',
    loadComponent: () =>
      import(
        './features/auth/recover-password/recover-password.component'
      ).then((m) => m.RecoverPasswordComponent),
  },
  {
    path: 'password-reset-confirmation',
    loadComponent: () =>
      import(
        './features/auth/password-reset-confirmation/password-reset-confirmation.component'
      ).then((m) => m.PasswordResetConfirmationComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./components/notifications-list/notifications-list.component').then(
        (m) => m.NotificationsListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'donor/equipment',
    loadComponent: () =>
      import('./features/equipment/equipment-list.component').then(
        (m) => m.EquipmentListComponent
      ),
    canActivate: [donorGuard],
  },
  {
    path: 'donor/equipment/create',
    loadComponent: () =>
      import('./features/equipment/equipment-create.component').then(
        (m) => m.EquipmentCreateComponent
      ),
    canActivate: [donorGuard],
  },
  {
    path: 'donor/equipment/:id',
    loadComponent: () =>
      import('./features/equipment/equipment-detail.component').then(
        (m) => m.EquipmentDetailComponent
      ),
    canActivate: [donorGuard],
  },
  {
    path: 'donor/donation',
    loadComponent: () =>
      import('./features/donation/donation-list.component').then(
        (m) => m.DonationListComponent
      ),
    canActivate: [donorGuard],
  },
  {
    path: 'donor/donation/:id',
    loadComponent: () =>
      import('./features/donation/donation-detail.component').then(
        (m) => m.DonationDetailComponent
      ),
    canActivate: [donorGuard],
  },
  {
    path: 'browse/equipment',
    loadComponent: () =>
      import('./features/equipment/equipment-browse.component').then(
        (m) => m.EquipmentBrowseComponent
      ),
    canActivate: [receptorGuard],
  },
  {
    path: 'browse/equipment/:id',
    loadComponent: () =>
      import('./features/equipment/equipment-detail.component').then(
        (m) => m.EquipmentDetailComponent
      ),
    canActivate: [receptorGuard],
  },
  {
    path: 'donation/create',
    loadComponent: () =>
      import('./features/donation/donation-create.component').then(
        (m) => m.DonationCreateComponent
      ),
    canActivate: [receptorGuard],
  },
  {
    path: 'donation/success/:id',
    loadComponent: () =>
      import('./features/donation/donation-success.component').then(
        (m) => m.DonationSuccessComponent
      ),
    canActivate: [receptorGuard],
  },
  {
    path: 'receptor/donation',
    loadComponent: () =>
      import('./features/donation/receptor-donation-list.component').then(
        (m) => m.ReceptorDonationListComponent
      ),
    canActivate: [receptorGuard],
  },
  {
    path: 'receptor/donation/:id',
    loadComponent: () =>
      import('./features/donation/receptor-donation-detail.component').then(
        (m) => m.ReceptorDonationDetailComponent
      ),
    canActivate: [receptorGuard],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
