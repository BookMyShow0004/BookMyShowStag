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
}

export interface Theatre {
  theatreId: number;
  name: string;
}

export interface ShowApi {
  showId: number;
  movieTitle?: string;
  theatreName?: string;
  showDateTime: string;
  ticketPrice: number;
  movieId?: number;
  theatreId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShowService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api';

  constructor(private http: HttpClient) { }

  addShow(show: Show): Observable<ShowResponse> {
    return this.http.post(`${this.apiUrl}/Shows`, show, { responseType: 'text' as 'json' }).pipe(
      map((responseText: any) => ({
        success: true,
        message: typeof responseText === 'string' ? responseText : JSON.stringify(responseText)
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

  updateShow(showId: number, show: Show): Observable<any> {
    return this.http.put(`${this.apiUrl}/Shows/${showId}`, show, { responseType: 'text' as 'json' });
  }

  deleteShow(showId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Shows/${showId}`, { responseType: 'text' as 'json' });
  }

  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/Movies`);
  }

  getTheatres(): Observable<Theatre[]> {
    return this.http.get<Theatre[]>(`${this.apiUrl}/Theatres`);
  }

  getAllShows(): Observable<ShowApi[]> {
    return this.http.get<ShowApi[]>(`${this.apiUrl}/Shows`);
  }
}