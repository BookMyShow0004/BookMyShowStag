import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Movie, Theatre, MovieService } from '../services/movie.service';
import { Seat, SeatService } from '../services/seat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-tickets',
  templateUrl: './book-tickets.component.html',
  styleUrls: ['./book-tickets.component.css']
})
export class BookTicketsComponent implements OnInit {
  @Input() movie: Movie | null = null;
  @Input() cityId: number | null = null;
  @Output() bookingComplete = new EventEmitter<void>();

  theatres: Theatre[] = [];
  selectedTheatre: Theatre | null = null;
  selectedShowtime: string | null = null;

  currentStep: number = 1;
  seats: Seat[] = [];
  selectedSeats: Seat[] = [];

  showSuccessModal: boolean = false;
  bookingDetails: any = null;

  constructor(private movieService: MovieService, private seatService: SeatService, private router: Router) {}

  ngOnInit(): void {
    if (this.movie && this.cityId) {
      this.movieService.getTheatresByMovieId(this.movie.movieId, this.cityId).subscribe((theatres: Theatre[]) => {
        this.theatres = theatres;
      });
    }
  }

  resetState(): void {
    this.selectedTheatre = null;
    this.selectedShowtime = null;
    this.seats = [];
    this.selectedSeats = [];
  }

  selectTheatre(theatre: Theatre): void {
    this.selectedTheatre = theatre;
    this.currentStep = 2;
    this.seatService.getSeatsByTheatre(theatre.theatreId).subscribe((seats: Seat[]) => {
      this.seats = seats;
      console.log(this.seats)
    });
  }

  selectShowtime(showtime: string): void {
    this.selectedShowtime = showtime;
    this.currentStep = 3;
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

  get bookingSeatNumbers(): string {
    return this.bookingDetails && this.bookingDetails.seats
      ? this.bookingDetails.seats.map((s: any) => s.seatNumber).join(', ')
      : '';
  }

  confirmBooking(): void {
    if (!this.selectedTheatre || !this.selectedShowtime || this.selectedSeats.length === 0) return;
    const currentUser = localStorage.getItem('currentUser');
    const userId = currentUser ? JSON.parse(currentUser).userId : null;

    if (!userId) {
      alert('User not logged in.');
      return;
    }
    const booking = {
      userId: Number(userId),
      showId: Number(this.selectedShowtime), 
      seatIds: this.selectedSeats.map(seat => seat.seatId)
    };
    console.log('Booking payload:', booking);
    this.movieService.createBooking(booking).subscribe(response => {
      this.bookingDetails = {
        movie: this.movie,
        theatre: this.selectedTheatre,
        showtime: this.selectedShowtime,
        seats: [...this.selectedSeats]
      };
      this.showSuccessModal = true;
      this.resetState();
    });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  goToDashboard(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/dashboard']);
  }
}
