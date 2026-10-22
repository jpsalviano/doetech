import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DonationService } from '../../services/donation.service';
import { ToastService } from '../../services/toast.service';
import { ErrorService } from '../../services/error.service';
import { Donation } from '../../models/donation.models';
import { catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-donation-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donation-success.component.html',
  styleUrls: ['./donation-success.component.css'],
})
export class DonationSuccessComponent implements OnInit {
  donation: Donation | null = null;
  loading = true;
  error = '';
  donationId: string | null = null;

  private donationService = inject(DonationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private errorService = inject(ErrorService);

  ngOnInit(): void {
    this.loadDonationDetails();
  }

  private loadDonationDetails(): void {
    this.donationId = this.route.snapshot.paramMap.get('id');

    if (!this.donationId) {
      this.error = 'ID da doação não encontrado';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    this.donationService
      .getDonationById(this.donationId)
      .pipe(
        catchError((error) => {
          this.error = this.errorService.handleError(
            error,
            'Erro ao carregar detalhes da doação.'
          );
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (donation) => {
          this.donation = donation;
        },
      });
  }

  onBackToBrowse(): void {
    this.router.navigate(['/browse/equipment']);
  }

  onViewProfile(): void {
    this.router.navigate(['/profile']);
  }

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      Pending: 'Pendente',
      InProgress: 'Em Andamento',
      Finished: 'Finalizada',
      Canceled: 'Cancelada',
    };
    return statuses[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      Pending: 'status-pending',
      InProgress: 'status-progress',
      Finished: 'status-success',
      Canceled: 'status-canceled',
    };
    return classes[status] || 'status-default';
  }

  formatDate(timestamp: number): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('pt-BR');
  }

  formatDateTime(timestamp: number): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('pt-BR');
  }
}
