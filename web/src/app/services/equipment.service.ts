import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, forkJoin, of, map } from 'rxjs';
import { EnvironmentService } from './environment.service';
import { ErrorService } from './error.service';
import {
  Equipment,
  CreateEquipmentRequest,
  UpdateEquipmentStatusRequest,
  EquipmentQueryDto,
} from '../models/equipment.models';

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
    private errorService: ErrorService
  ) {}

  createEquipment(
    equipmentData: CreateEquipmentRequest
  ): Observable<Equipment> {
    return this.http
      .post<Equipment>(this.env.equipmentEndpoints.base, equipmentData)
      .pipe(
        catchError((error) => {
          const errorMessage = this.errorService.handleError(
            error,
            'Failed to create equipment'
          );
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getEquipments(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(this.env.equipmentEndpoints.base).pipe(
      catchError((error) => {
        const errorMessage = this.errorService.handleError(
          error,
          'Failed to fetch equipments'
        );
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  queryEquipments(queryParams: EquipmentQueryDto): Observable<Equipment[]> {
    let params = new HttpParams();

    if (queryParams.accountId) {
      params = params.set('accountId', queryParams.accountId);
    }
    if (queryParams.createdAtFrom !== undefined) {
      params = params.set(
        'createdAtFrom',
        queryParams.createdAtFrom.toString()
      );
    }
    if (queryParams.createdAtTo !== undefined) {
      params = params.set('createdAtTo', queryParams.createdAtTo.toString());
    }
    if (queryParams.page !== undefined) {
      params = params.set('page', queryParams.page.toString());
    }
    if (queryParams.pageSize !== undefined) {
      params = params.set('pageSize', queryParams.pageSize.toString());
    }

    return this.http
      .get<Equipment[]>(this.env.equipmentEndpoints.query, { params })
      .pipe(
        catchError((error) => {
          const errorMessage = this.errorService.handleError(
            error,
            'Failed to query equipments'
          );
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getEquipmentById(equipmentId: string): Observable<Equipment> {
    return this.http
      .get<Equipment>(this.env.equipmentEndpoints.getById(equipmentId))
      .pipe(
        catchError((error) => {
          const errorMessage = this.errorService.handleError(
            error,
            'Failed to fetch equipment'
          );
          return throwError(() => new Error(errorMessage));
        })
      );
  }
  updateEquipmentStatus(
    equipmentId: string,
    statusData: UpdateEquipmentStatusRequest
  ): Observable<void> {
    return this.http
      .put<void>(
        this.env.equipmentEndpoints.updateStatus(equipmentId),
        statusData
      )
      .pipe(
        catchError((error) => {
          const errorMessage = this.errorService.handleError(
            error,
            'Failed to update equipment status'
          );
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getEquipmentsByIds(equipmentIds: string[]): Observable<Equipment[]> {
    const equipmentRequests = equipmentIds.map((id) =>
      this.getEquipmentById(id).pipe(
        catchError((error) => {
          return of(null);
        })
      )
    );

    return forkJoin(equipmentRequests).pipe(
      map(
        (equipments) => equipments.filter((eq) => eq !== null) as Equipment[]
      ),
      catchError((error) => {
        const errorMessage = this.errorService.handleError(
          error,
          'Failed to fetch equipments'
        );
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
