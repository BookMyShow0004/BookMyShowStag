import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface Movie {
  movieId: number;
  title: string;
  description: string;
  durationMins: number;
  genre: string;
  language: string;
  releaseDate: string;
  posterBase64?: string;
  isActive: boolean;
  createdBy?: string;
}

export interface MovieReview {
  reviewId: number;
  movieId: number;
  movieTitle: string;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export interface MovieComment {
  commentId: number;
  userName: string;
  movieTitle: string;
  content: string;
  createdAt: string;
}

export interface Booking {
  bookingId: number;
  userFullName: string;
  movieTitle: string;
  theatreName: string;
  bookingTime: string;
  totalAmount: number;
  seatNumbers: string[];
}

export interface Theatre {
  theatreId: number;
  name: string;
  address: string;
  showTimes: string[];
  amenities: string[];
  rating: number;
}

export interface Seat {
  showSeatId: number;
  seatId: number;
  showId: number;
  movieTitle: string;
  seatNumber: string;
  seatType: string;
  isBooked: boolean;
  theatreName: string | null;
  status: 'available' | 'selected' | 'booked';
}

export interface RatingRequest {
  movieId: number;
  rating: number;
  review?: string;
}

export interface CommentRequest {
  movieId: number;
  comment: string;
}

export interface Show {
  showId: number;
  movieId: number;
  theatreId: number;
  showDateTime: string;
  ticketPrice: string;
  theatreName?: string; // Optional, can be fetched separately
  movieTitle?: string; // Optional, can be fetched separately
  // Add other fields as needed
}

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api';

  constructor(private http: HttpClient) { }

  // Movies
  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/Movies`);
  }

  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/Movies/${id}`);
  }

  createMovie(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/Movies`, formData, { responseType: 'text' });
  }

  updateMovie(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/Movies/${id}`, formData, { responseType: 'text' });
  }

  deleteMovie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Movies/${id}`);
  }

  // Reviews
  getMovieReviews(movieId: number): Observable<MovieReview[]> {
    return this.http.get<MovieReview[]>(`${this.apiUrl}/Reviews?movieId=${movieId}`);
  }

  addReview(review: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Reviews`, review);
  }

  updateReview(id: number, review: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Reviews/${id}`, review);
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Reviews/${id}`);
  }

  // Add this method to fetch all reviews
  getAllReviews(): Observable<MovieReview[]> {
    return this.http.get<MovieReview[]>(`${this.apiUrl}/Reviews`);
  }

  // Comments
  getMovieComments(movieId: number): Observable<MovieComment[]> {
    return this.http.get<MovieComment[]>(`${this.apiUrl}/Comments/ByMovie/${movieId}`);
  }

  getAllMovieComments(): Observable<MovieComment[]> {
    return this.http.get<MovieComment[]>(`${this.apiUrl}/Comments`);
  }

  addComment(comment: any): Observable<any> {
    // Set responseType: 'text' to handle plain text backend responses
    return this.http.post(`${this.apiUrl}/Comments`, comment, { responseType: 'text' });
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Comments/${id}`);
  }

  // Bookings
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/Bookings`);
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/Bookings/${id}`);
  }

  createBooking(booking: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Bookings`, booking);
  }

  updateBooking(id: number, booking: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Bookings/${id}`, booking);
  }

  deleteBooking(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Bookings/${id}`);
  }

  getTheatresByMovieId(movieId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Theatres/ByMovie/${movieId}`);
  }

  getSeatsForShow(movieId: number, theatreId: number, showTime: string): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/ShowSeats?movieId=${movieId}&theatreId=${theatreId}&showTime=${encodeURIComponent(showTime)}`);
  }
  getShowTimeByMovieAndTheatre(movieId: number, theatreId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Shows/ByMovieAndTheatre?movieId=${movieId}&theatreId=${theatreId}`);
  }

  getTheatres(city: string): Observable<Theatre[]> {
    return this.http.get<Theatre[]>(`${this.apiUrl}/Theatres?city=${encodeURIComponent(city)}`);
  }

  addRating(request: RatingRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Reviews`, request);
  }

  likeReview(reviewId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Reviews/${reviewId}/like`, {});
  }

  likeComment(commentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Comments/${commentId}/like`, {});
  }

  getUserBookings(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/Bookings?userId=${userId}`);
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Bookings/${bookingId}/cancel`, {});
  }

  rescheduleBooking(bookingId: number, newShowTime: string, newDate: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Bookings/${bookingId}/reschedule`, { newShowTime, newDate });
  }

  addSeat(seat: { theatreId: number, seatNumber: string, seatType: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Seats`, seat);
  }

  getShowDetailsById(showId: number): Observable<Show> {
    return this.http.get<Show>(`${this.apiUrl}/Shows/${showId}`);
  }

  getAllSeatsByShow(showId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/ShowSeats/AllByShow/${showId}`);
  }

  getTheatreById(theatreId: number): Observable<Theatre> {
    return this.http.get<Theatre>(`${this.apiUrl}/Theatres/${theatreId}`);
  }
}
