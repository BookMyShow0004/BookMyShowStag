import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShowSeatService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api/ShowSeats';

  constructor(private http: HttpClient) {}

  getAllShowSeats(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getShowSeatById(showSeatId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${showSeatId}`);
  }

  createShowSeat(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, { responseType: 'text' as 'json' });
  }

  updateShowSeat(showSeatId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${showSeatId}`, data, { responseType: 'text' as 'json' });
  }

  deleteShowSeat(showSeatId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${showSeatId}`, { responseType: 'text' as 'json' });
  }
}
