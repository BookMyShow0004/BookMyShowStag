import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private alertService: AlertService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.showId = Number(this.route.snapshot.paramMap.get('showId'));
    this.movieService.getAllSeatsByShow(this.showId).subscribe({
      next: (seats: Seat[]) => {
        this.seats = seats;
        this.isLoading = false;
        console.log(this.seats)
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
    const bookingRequest = {
      userId: Number(userId),
      showId: Number(this.showId),
      seatIds: this.selectedSeats.map(id => Number(id))
    };
    console.log('Booking payload:', bookingRequest);
    this.bookingService.bookSeats(bookingRequest).subscribe({
      next: () => {
        this.alertService.showAlert('Seats booked successfully!');
        this.selectedSeats = [];
        this.ngOnInit(); // reload seats
      },
      error: (err) => {
        console.error('Booking error:', err);
        this.alertService.showAlert('Failed to book seats. Please try again.');
      }
    });
  }
}
