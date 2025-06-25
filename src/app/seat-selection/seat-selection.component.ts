import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService, Seat } from '../services/movie.service';
import { AlertService } from '../shared/alert.service';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.css']
})
export class SeatSelectionComponent implements OnInit {
  showId!: number;
  movieId!: number;
  theatreId!: number;
  showTime!: string;
  seats: Seat[] = [];
  selectedSeats: number[] = [];
  isLoading = true;
  errorMessage = '';
  theatreAddress: string = '';

  movieTitle: string = '';
  theatreName: string = '';
  ticketPrice: string = '';
  showDate: string = '';
  showTimeStr: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private alertService: AlertService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.showId = Number(this.route.snapshot.paramMap.get('showId'));
    // Fetch show details
    this.movieService.getShowDetailsById(this.showId).subscribe({
      next: (show) => {
        console.log('Show details:', show);
        this.movieId = show.movieId;
        this.theatreId = show.theatreId;
        this.showTime = show.showDateTime;
        this.ticketPrice = show.ticketPrice;
        this.showDate = new Date(show.showDateTime).toLocaleDateString();
        this.showTimeStr = new Date(show.showDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        // Prefer backend response fields if available
        this.movieTitle = show.movieTitle || '';
        this.theatreName = show.theatreName || '';
        // Fetch movie and theatre details only if missing
        if (!this.movieTitle && show.movieId) {
          this.movieService.getMovieById(show.movieId).subscribe(m => this.movieTitle = m.title);
        }
        if (!this.theatreName && show.theatreId) {
          this.movieService.getTheatreById(show.theatreId).subscribe(t => {
            this.theatreName = t.name;
            this.theatreAddress = t.address;
          });
        }
      },
      error: () => {}
    });
    this.movieService.getAllSeatsByShow(this.showId).subscribe({
      next: (seats: Seat[]) => {
        this.seats = seats;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load seats.';
        this.isLoading = false;
      }
    });
  }

  toggleSeat(seat: Seat): void {
    if (seat.status === 'booked' || seat.isBooked) return;
    const index = this.selectedSeats.indexOf(seat.seatId);
    if (index > -1) {
      // Seat is already selected, remove it
      this.selectedSeats.splice(index, 1);
    } else {
      // Add seatId to selection
      this.selectedSeats.push(seat.seatId);
    }
  }

  bookSeats(): void {
    if (this.selectedSeats.length === 0) {
      this.alertService.showAlert('Please select at least one seat.');
      return;
    }
    const currentUser = localStorage.getItem('currentUser');
    const userId = currentUser ? JSON.parse(currentUser).userId : null;
    if (!userId) {
      this.alertService.showAlert('User not logged in.');
      return;
    }
    // Prepare booking data for navigation
    const bookingData = {
      userId: Number(userId),
      showId: Number(this.showId),
      seatIds: this.selectedSeats.map(id => Number(id)),
      movieTitle: this.movieTitle,
      theatreName: this.theatreName,
      showDate: this.showDate,
      showTimeStr: this.showTimeStr,
      seatNumbers: this.seats.filter(s => this.selectedSeats.includes(s.seatId)).map(s => s.seatNumber),
      totalPrice: this.selectedSeats.length * Number(this.ticketPrice)
    };
    this.router.navigate(['/booking'], { state: bookingData });
  }
}
