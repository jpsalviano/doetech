import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';
import { MainComponent } from './components/layout/main/main.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { AuthService } from './services/auth.service';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    HeaderComponent, 
    MainComponent, 
    FooterComponent, 
    ToastContainerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DoeTech-frontend';
  
  private router = inject(Router);
  private authService = inject(AuthService);

  isAdminRoute$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map((event: NavigationEnd) => event.url.startsWith('/admin'))
  );

  get shouldShowRegularLayout(): boolean {
    const currentUrl = this.router.url;
    const isAdmin = this.authService.isAdmin();
    const isAdminRoute = currentUrl.startsWith('/admin');
    
    return !isAdmin && !isAdminRoute;
  }
}
