import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookingRequest {
  userId: number;
  showId: number;
  seatIds: number[];
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api/Bookings';

  constructor(private http: HttpClient) {}

  bookSeats(request: BookingRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request);
  }
}
