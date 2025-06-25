import { Component, OnInit } from '@angular/core';
import { BookingService, Booking } from '../../services/booking.service';

@Component({
  selector: 'app-booking-management',
  templateUrl: './booking-management.component.html',
  styleUrls: ['./booking-management.component.css']
})
export class BookingManagementComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private bookingService: BookingService) { }

  ngOnInit() {
    this.fetchBookings();
  }

  fetchBookings() {
    this.isLoading = true;
    this.bookingService.getBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load bookings';
        this.isLoading = false;
      }
    });
  }

  cancelBooking(bookingId: number) {
    this.isLoading = true;
    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => b.bookingId !== bookingId);
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to cancel booking';
        this.isLoading = false;
      }
    });
  }
}
