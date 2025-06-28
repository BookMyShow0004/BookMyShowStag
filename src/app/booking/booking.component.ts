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

  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  showToast = false;
  showSuccessModal = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private bookingService: BookingService
  ) {}

  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  ngOnInit(): void {
    // Retrieve booking data from navigation state (use history.state for reliability)
    this.bookingData = history.state || {};
  }

  confirmBooking(): void {
    if (!this.bookingData || !this.bookingData.seatIds || !this.bookingData.showId) {
      this.errorMessage = 'Missing booking information.';
      this.showToastMessage(this.errorMessage, 'error');
      return;
    }
    this.isLoading = true;
    this.bookingService.bookSeats({
      userId: this.bookingData.userId,
      showId: this.bookingData.showId,
      seatIds: this.bookingData.seatIds
    }).subscribe({
      next: () => {
        this.showToastMessage('Booking successful!', 'success');
        this.isLoading = false;
        this.showSuccessModal = true;
      },
      error: (err) => {
        this.errorMessage = 'Booking failed. Please try again.';
        this.showToastMessage(this.errorMessage, 'error');
        this.isLoading = false;
      }
    });
  }

  goToDashboard(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/dashboard']);
  }
}
