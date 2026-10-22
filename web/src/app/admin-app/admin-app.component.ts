import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastContainerComponent } from '../components/toast-container/toast-container.component';

@Component({
  selector: 'app-admin-app',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastContainerComponent
  ],
  templateUrl: './admin-app.component.html',
  styleUrls: ['./admin-app.component.css']
})
export class AdminAppComponent {
  private authService = inject(AuthService);

  get currentUser() {
    return this.authService.getUserInfo();
  }

  logout(): void {
    this.authService.logout();
  }
}
