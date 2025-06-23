import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Show {
  showId?: number;
  movieId: number;
  theatreId: number;
  showDateTime: string;
  ticketPrice: number;
}

export interface ShowResponse {
  success: boolean;
  message: string;
  show?: Show;
}

export interface Movie {
  movieId: number;
  title: string;
  // description?: string; // add other properties if needed
}

export interface Theater {
  theatreId: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShowService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api';

  constructor(private http: HttpClient) { }

  addShow(show: Show): Observable<ShowResponse> {
    return this.http.post(`${this.apiUrl}/Shows`, show, {
      responseType: 'text'
    }).pipe(
      map((responseText: string) => ({
        success: true,
        message: responseText
      })),
      catchError((error) => {
        let message = 'Failed to add show';
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

  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/Movies`);
  }

  getTheaters(): Observable<Theater[]> {
    return this.http.get<Theater[]>(`${this.apiUrl}/Theatres`);
  }
} 