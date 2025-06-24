import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Movie, Theater, MovieService } from '../services/movie.service';
import { Seat, SeatService } from '../services/seat.service';

@Component({
  selector: 'app-book-tickets',
  templateUrl: './book-tickets.component.html',
  styleUrls: ['./book-tickets.component.css']
})
export class BookTicketsComponent implements OnInit {
  @Input() movie: Movie | null = null;
  @Output() bookingComplete = new EventEmitter<void>();

  theaters: Theater[] = [];
  selectedTheater: Theater | null = null;
  selectedShowtime: string | null = null;

  currentStep: number = 1;
  seats: Seat[] = [];
  selectedSeats: Seat[] = [];

  constructor(private movieService: MovieService, private seatService: SeatService) {}

  ngOnInit(): void {
    if (this.movie) {
      this.movieService.getTheatersByMovieId(this.movie.movieId).subscribe((theaters: Theater[]) => {
        this.theaters = theaters;
      });
    }
  }

  resetState(): void {
    this.selectedTheater = null;
    this.selectedShowtime = null;
    this.seats = [];
    this.selectedSeats = [];
  }

  selectTheater(theater: Theater): void {
    this.selectedTheater = theater;
    this.currentStep = 2;
    // Fetch seats for the selected theater
    this.seatService.getSeatsByTheater(theater.theatreId).subscribe((seats: Seat[]) => {
      this.seats = seats;
    });
  }

  selectShowtime(showtime: string): void {
    this.selectedShowtime = showtime;
    this.currentStep = 3;
    // Optionally, fetch seats for showtime if needed
  }

  toggleSeat(seat: Seat): void {
    if (seat.status === 'booked') return;
    const index = this.selectedSeats.indexOf(seat);
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push(seat);
    }
  }

  confirmBooking(): void {
    if (!this.selectedTheater || !this.selectedShowtime || this.selectedSeats.length === 0) return;
    const booking = {
      movieId: this.movie?.movieId,
      theaterId: this.selectedTheater.theatreId,
      showTime: this.selectedShowtime,
      seatNumbers: this.selectedSeats.map(seat => seat.seatNumber),
      // Add user info if needed
    };
    this.movieService.createBooking(booking).subscribe(response => {
      // Handle booking confirmation (success/failure)
      this.bookingComplete.emit();
      this.resetState();
    });
  }
}
