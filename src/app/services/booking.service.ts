import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookingRequest {
  userId: number;
  showId: number;
  seatIds: number[];
}

export interface Booking {
  bookingId: number;
  userFullName: string;
  movieTitle: string;
  theatreName: string;
  bookingTime: string;
  seatNumbers: string[];
  totalAmount: number;
  // Add other booking fields as needed
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api/Bookings';

  constructor(private http: HttpClient) { }

  bookSeats(request: BookingRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request, { responseType: 'text' as 'json' });
  }

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${bookingId}`);
  }
}
