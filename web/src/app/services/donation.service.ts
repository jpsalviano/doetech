import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';
import {
  Donation,
  CreateDonationRequest,
  UpdateDonationRequest,
  DonationQueryDto,
  DonationCart,
  DonationStatus
} from '../models/donation.models';
import { Equipment } from '../models/equipment.models';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);

  private donationCartSubject = new BehaviorSubject<DonationCart | null>(null);
  public donationCart$ = this.donationCartSubject.asObservable();

  createDonation(request: CreateDonationRequest): Observable<Donation> {
    return this.http.post<Donation>(
      this.environmentService.donationEndpoints.base,
      request
    );
  }

  getDonationById(donationId: string): Observable<Donation> {
    return this.http.get<Donation>(
      this.environmentService.donationEndpoints.getById(donationId)
    );
  }

  updateDonation(donationId: string, request: UpdateDonationRequest): Observable<Donation> {
    return this.http.put<Donation>(
      this.environmentService.donationEndpoints.update(donationId),
      request
    );
  }

  updateDonationStatus(donationId: string, status: DonationStatus): Observable<void> {
    return this.http.put<void>(
      this.environmentService.donationEndpoints.updateStatus(donationId),
      `"${status}"`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  getAllDonations(): Observable<Donation[]> {
    return this.http.get<Donation[]>(
      this.environmentService.donationEndpoints.base
    );
  }

  queryDonations(query: DonationQueryDto): Observable<Donation[]> {
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
    return this.http.get<Donation[]>(this.environmentService.donationEndpoints.query, { params });
  }

  initializeDonationCart(donorAccountId: string): void {
    const cart: DonationCart = {
      donorAccountId,
      selectedEquipments: []
    };
    this.donationCartSubject.next(cart);
  }

  addEquipmentToCart(equipment: Equipment): boolean {
    const currentCart = this.donationCartSubject.value;
    
    if (!currentCart) {
      this.initializeDonationCart(equipment.donorAccountId);
      return this.addEquipmentToCart(equipment);
    }

    if (currentCart.donorAccountId !== equipment.donorAccountId) {
      return false;
    }

    const isAlreadySelected = currentCart.selectedEquipments.some(
      eq => eq.id === equipment.id
    );

    if (!isAlreadySelected) {
      const updatedCart: DonationCart = {
        ...currentCart,
        selectedEquipments: [...currentCart.selectedEquipments, equipment]
      };
      this.donationCartSubject.next(updatedCart);
    }

    return true;
  }

  removeEquipmentFromCart(equipmentId: string): void {
    const currentCart = this.donationCartSubject.value;
    
    if (!currentCart) return;

    const updatedCart: DonationCart = {
      ...currentCart,
      selectedEquipments: currentCart.selectedEquipments.filter(
        eq => eq.id !== equipmentId
      )
    };

    this.donationCartSubject.next(updatedCart);

    if (updatedCart.selectedEquipments.length === 0) {
      this.clearDonationCart();
    }
  }

  clearDonationCart(): void {
    this.donationCartSubject.next(null);
  }

  isEquipmentInCart(equipmentId: string): boolean {
    const currentCart = this.donationCartSubject.value;
    return currentCart?.selectedEquipments.some(eq => eq.id === equipmentId) || false;
  }

  canSelectEquipment(equipment: Equipment): boolean {
    const currentCart = this.donationCartSubject.value;
    
    if (!currentCart) return true;
    
    return currentCart.donorAccountId === equipment.donorAccountId;
  }

  getCartItemCount(): number {
    const currentCart = this.donationCartSubject.value;
    return currentCart?.selectedEquipments.length || 0;
  }

  createDonationFromCart(recipientAccountId: string): Observable<Donation> {
    const currentCart = this.donationCartSubject.value;
    
    if (!currentCart || currentCart.selectedEquipments.length === 0) {
      throw new Error('No equipment selected for donation');
    }

    const request: CreateDonationRequest = {
      recipientAccountId,
      equipmentIds: currentCart.selectedEquipments.map(eq => eq.id),
      status: DonationStatus.Pending
    };

    return this.createDonation(request);
  }

  getDonationByEquipment(equipmentId: string): Observable<Donation | null> {
    const query: DonationQueryDto = {
      equipmentIds: [equipmentId]
    };
    
    return this.queryDonations(query).pipe(
      map((donations: Donation[]) => donations.length > 0 ? donations[0] : null)
    );
  }
}