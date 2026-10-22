import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { AccountService } from '../../services/account.service';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../services/toast.service';
import { ErrorService } from '../../services/error.service';
import {
  PaginationService,
  PaginationState,
  PaginationConfig,
} from '../../services/pagination.service';
import { Equipment, EquipmentQueryDto } from '../../models/equipment.models';
import { catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipment-list.component.html',
  styleUrls: ['./equipment-list.component.css'],
})
export class EquipmentListComponent implements OnInit {
  paginationState: PaginationState<Equipment>;
  paginationConfig: PaginationConfig = {
    pageSize: 10,
  };
  error = '';
  
  equipmentImages: Map<string, string> = new Map();

  private equipmentService = inject(EquipmentService);
  private accountService = inject(AccountService);
  private fileService = inject(FileService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private errorService = inject(ErrorService);
  private paginationService = inject(PaginationService);

  constructor() {
    this.paginationState =
      this.paginationService.createPaginationState<Equipment>(
        this.paginationConfig
      );
  }

  get equipments(): Equipment[] {
    return this.paginationState.items;
  }

  get loading(): boolean {
    return this.paginationState.loading;
  }

  get hasMoreItems(): boolean {
    return this.paginationState.hasMoreItems;
  }
  ngOnInit(): void {
    this.loadEquipments();
  }

  loadEquipments(): void {
    const currentAccount = this.accountService.getAccountInfo();

    if (!currentAccount?.id) {
      this.error =
        'Não foi possível obter informações da conta. Faça login novamente.';
      this.paginationState.loading = false;
      return;
    }

    this.paginationState.loading = true;
    this.error = '';

    const queryParams: EquipmentQueryDto = {
      accountId: currentAccount.id,
      page: this.paginationState.currentPage,
      pageSize: this.paginationConfig.pageSize,
    };

    this.equipmentService
      .queryEquipments(queryParams)
      .pipe(
        catchError((error) => {
          this.error = this.errorService.handleError(
            error,
            'Erro ao carregar equipamentos. Tente novamente.'
          );
          this.toastService.error(this.error);
          return of([]);
        }),
        finalize(() => (this.paginationState.loading = false))
      )
      .subscribe({
        next: (data) => {
          this.paginationService.updateItems(
            this.paginationState,
            data,
            this.paginationConfig.pageSize,
            this.paginationState.currentPage === 1
          );
          this.loadEquipmentImages();
        },
      });
  }

  loadMoreEquipments(): void {
    if (!this.hasMoreItems || this.loading) return;

    const scrollPosition = window.pageYOffset;
    this.paginationState.currentPage++;

    const currentAccount = this.accountService.getAccountInfo();
    if (!currentAccount?.id) return;

    this.equipmentService
      .queryEquipments({
        accountId: currentAccount.id,
        page: this.paginationState.currentPage,
        pageSize: this.paginationConfig.pageSize,
      })
      .pipe(
        catchError((error) => {
          this.toastService.error('Erro ao carregar mais equipamentos.');
          return of([]);
        }),
        finalize(() => (this.paginationState.loading = false))
      )
      .subscribe({
        next: (data) => {
          this.paginationService.updateItems(
            this.paginationState,
            data,
            this.paginationConfig.pageSize,
            false
          );

          setTimeout(() => {
            window.scrollTo(0, scrollPosition);
          }, 0);
        },
      });
  }

  refreshEquipments(): void {
    this.paginationService.reset(this.paginationState, true);
    this.loadEquipments();
  }

  createEquipment(): void {
    this.router.navigate(['/donor/equipment/create']);
  }
  viewEquipment(id: string): void {
    this.router.navigate(['/donor/equipment', id]);
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      Available: 'Disponível',
      OnGoing: 'Enviado',
      InProgress: 'Em processo de doação',
      Finished: 'Finalizado',
      Canceled: 'Cancelado',
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Available: 'status-available',
      OnGoing: 'status-ongoing',
      InProgress: 'status-inprogress',
      Finished: 'status-finished',
      Canceled: 'status-canceled',
    };
    return statusClasses[status] || '';
  }

  getTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      Desktop: 'Desktop',
      SmartPhone: 'Smartphone',
      Tablet: 'Tablet',
      Notebook: 'Notebook',
      Peripherals: 'Periféricos',
    };
    return typeLabels[type] || type;
  }
  formatDate(timestamp: number): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('pt-BR');
  }

  loadEquipmentImages(): void {
    this.equipments.forEach(equipment => {
      this.fileService.getEquipmentPictureUrl(equipment.id)
        .pipe(
          catchError(() => of(null))
        )
        .subscribe(response => {
          if (response?.url) {
            this.equipmentImages.set(equipment.id, response.url);
          }
        });
    });
  }

  getEquipmentImageUrl(equipmentId: string): string | null {
    return this.equipmentImages.get(equipmentId) || null;
  }
}
