import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Seat {
  seatId: number;
  theatreId: number;
  theatreName: string;
  seatNumber: string;
  seatType: string;
  status?: 'available' | 'booked';
}

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api/Seats';

  constructor(private http: HttpClient) {}

  getAllSeats(): Observable<Seat[]> {
    return this.http.get<Seat[]>(this.apiUrl);
  }

  getSeatsByTheatre(theatreId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}?theatreId=${theatreId}`);
  }

  updateSeat(seat: Seat): Observable<any> {
    return this.http.put(`${this.apiUrl}/${seat.seatId}`, seat, { responseType: 'text' as 'json' });
  }

  deleteSeat(seatId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${seatId}`, { responseType: 'text' as 'json' });
  }

  getAllSeatsByTheatre(theatreId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/ByTheatre/${theatreId}`);
  }

  logAllSeats(): void {
    this.getAllSeats().subscribe({
      next: (seats) => {
        console.log('All seats:', seats);
      },
      error: (err) => {
        console.error('Failed to fetch seats:', err);
      }
    });
  }
}