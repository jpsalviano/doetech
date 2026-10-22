import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor() {}

  getSystemStats(): Observable<any> {
    return of({
      message: 'Readonly'
    });
  }
}
