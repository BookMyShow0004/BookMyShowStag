import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookingData: any;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    // Retrieve booking data from navigation state (use history.state for reliability)
    this.bookingData = history.state || {};
  }

  confirmBooking(): void {
    if (!this.bookingData || !this.bookingData.seatIds || !this.bookingData.showId) {
      this.errorMessage = 'Missing booking information.';
      return;
    }
    this.isLoading = true;
    this.bookingService.bookSeats({
      userId: this.bookingData.userId,
      showId: this.bookingData.showId,
      seatIds: this.bookingData.seatIds
    }).subscribe({
      next: () => {
        alert('Booking successful!');
        this.isLoading = false;
        this.router.navigate(['/my-bookings']);
      },
      error: (err) => {
        this.errorMessage = 'Booking failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
