import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { City } from './auth.service';

export interface Theater {
  theaterId?: number;
  name: string;
  address: string;
  cityId: number;
}

export interface TheaterResponse {
  success: boolean;
  message: string;
  theater?: Theater;
}

@Injectable({
  providedIn: 'root'
})
export class TheaterService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api';

  constructor(private http: HttpClient) { }

  addTheater(theater: Theater): Observable<TheaterResponse> {
    return this.http.post(`${this.apiUrl}/Theatres`, theater, {
      responseType: 'text'
    }).pipe(
      map((responseText: string) => ({
        success: true,
        message: responseText
      })),
      catchError((error) => {
        let message = 'Failed to add theater';
        if (typeof error.error === 'string') {
          message = error.error;
        } else if (error.error && error.error.errors) {
          message = Object.values(error.error.errors).flat().join(' ');
        } else if (error.error) {
          message = error.error;
        }
        return of({ success: false, message });
      })
    );
  }

  getCities(): Observable<City[]> {
    return this.http.get<City[]>(`${this.apiUrl}/Cities`);
  }

  getTheaters(): Observable<Theater[]> {
    return this.http.get<Theater[]>(`${this.apiUrl}/Theatres`);
  }
} 