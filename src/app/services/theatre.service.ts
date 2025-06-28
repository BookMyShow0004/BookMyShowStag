import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { City } from './auth.service';

export interface Theatre {
  theatreId?: number;
  name: string;
  address: string;
  cityId: number;
}

export interface TheatreResponse {
  success: boolean;
  message: string;
  theatre?: Theatre;
}

@Injectable({
  providedIn: 'root'
})
export class TheatreService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api';

  constructor(private http: HttpClient) { }

  addTheatre(theatre: Theatre): Observable<TheatreResponse> {
    return this.http.post(`${this.apiUrl}/Theatres`, theatre, { responseType: 'text' as 'json' }).pipe(
      map((responseText: any) => ({
        success: true,
        message: typeof responseText === 'string' ? responseText : JSON.stringify(responseText)
      })),
      catchError((error) => {
        let message = 'Failed to add theatre';
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

  getTheatres(): Observable<Theatre[]> {
    return this.http.get<Theatre[]>(`${this.apiUrl}/Theatres`);
  }

  deleteTheatre(theatreId: number) {
    return this.http.delete(`${this.apiUrl}/Theatres/${theatreId}`, { responseType: 'text' as 'json' });
  }
}