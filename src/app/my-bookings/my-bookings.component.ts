import { Component, OnInit } from '@angular/core';
import { MovieService, Booking } from '../services/movie.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  activeTab: string = 'upcoming';
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  currentUser: any = localStorage.getItem('currentUser');

  // Filter and Search
  searchQuery: string = '';
  selectedStatus: string = '';
  selectedDate: string = '';

  // UI States
  showCancelModal: boolean = false;
  showRescheduleModal: boolean = false;
  selectedBooking: Booking | null = null;
  isProcessing: boolean = false;

  // Reschedule form
  newShowTime: string = '';
  newDate: string = '';

  // Filter options
  statusOptions: string[] = ['confirmed', 'cancelled', 'completed'];
  dateOptions: string[] = ['today', 'tomorrow', 'this-week', 'next-week'];

  constructor(
    private movieService: MovieService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // this.currentUser = this.authService.getCurrentUser();
    this.loadBookings();
    console.log(this.currentUser);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getActiveBookings(): Booking[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.filteredBookings.filter(b => new Date(b.bookingTime) >= today);
  }

  loadBookings(): void {
    if (!this.currentUser) {
      this.errorMessage = 'Please login to view your bookings';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const user = JSON.parse(this.currentUser);
    this.movieService.getUserBookingsByUserId(user.userId).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.filteredBookings = bookings;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load bookings';
        this.isLoading = false;
        console.error('Error loading bookings:', error);
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.bookings];
    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.movieTitle.toLowerCase().includes(query) ||
        booking.theatreName.toLowerCase().includes(query) ||
        booking.bookingId.toString().toLowerCase().includes(query)
      );
    }
    // Date filter
    if (this.selectedDate) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
      const nextWeekStart = new Date(thisWeekStart);
      nextWeekStart.setDate(thisWeekStart.getDate() + 7);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.bookingTime);
        switch (this.selectedDate) {
          case 'today':
            return bookingDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return bookingDate.toDateString() === tomorrow.toDateString();
          case 'this-week':
            return bookingDate >= thisWeekStart && bookingDate <= thisWeekEnd;
          case 'next-week':
            return bookingDate >= nextWeekStart && bookingDate <= nextWeekEnd;
          default:
            return true;
        }
      });
    }
    this.filteredBookings = filtered;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedDate = '';
    this.filteredBookings = [...this.bookings];
  }

  openCancelModal(booking: Booking): void {
    this.selectedBooking = booking;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.selectedBooking = null;
  }

  openRescheduleModal(booking: Booking): void {
    this.selectedBooking = booking;
    this.newShowTime = booking.bookingTime;
    this.newDate = booking.bookingTime;
    this.showRescheduleModal = true;
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal = false;
    this.selectedBooking = null;
    this.newShowTime = '';
    this.newDate = '';
  }

  cancelBooking(bookingId: number, event?: Event) {
    if (event) event.preventDefault();
    this.isProcessing = true;
    this.movieService.cancelBooking(bookingId).subscribe({
      next: () => {
        const booking = this.bookings.find(b => b.bookingId === bookingId);
        if (booking) booking.status = 'cancelled';
        this.successMessage = 'Booking cancelled successfully.';
        this.isProcessing = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to cancel booking.';
        this.isProcessing = false;
        console.error('Cancel booking error:', err);
      }
    });
  }

  rescheduleBooking(): void {
    if (!this.selectedBooking || !this.newShowTime || !this.newDate) {
      this.errorMessage = 'Please select new show time and date';
      return;
    }
    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.movieService.rescheduleBooking(
      this.selectedBooking.bookingId,
      this.newShowTime,
      this.newDate
    ).subscribe({
      next: (response) => {
        this.isProcessing = false;
        if (response.success) {
          this.successMessage = response.message;
          this.closeRescheduleModal();
          this.loadBookings();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isProcessing = false;
        this.errorMessage = 'Failed to reschedule booking';
        console.error('Error rescheduling booking:', error);
      }
    });
  }

  getSeatsText(seats: string[]): string {
    if (seats.length === 1) {
      return `Seat ${seats[0]}`;
    }
    return `Seats ${seats.join(', ')}`;
  }

  getFilteredCount(): number {
    return this.filteredBookings.length;
  }

  getTotalCount(): number {
    return this.bookings.length;
  }

  goToRescheduleShows(booking: Booking) {
    // Call cancel API, then redirect to shows page using movieId and theatreId from booking
    if (!booking.movieId || !booking.theatreId) {
      alert('Movie or Theatre information missing for this booking.');
      return;
    }
    this.isProcessing = true;
    this.movieService.cancelBooking(booking.bookingId).subscribe({
      next: () => {
        this.isProcessing = false;
        this.successMessage = 'Booking cancelled successfully.';
        this.router.navigate(['/shows', booking.movieId, booking.theatreId]);
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMessage = 'Failed to cancel booking, but redirecting to reschedule page.';
        this.router.navigate(['/shows', booking.movieId, booking.theatreId]);
        console.error('Cancel booking error:', err);
      }
    });
  }

  // Helper methods if needed
  getMovieIdFromBooking(booking: Booking): number | null {
    // If booking.movieId is not present, try to map from movieTitle
    // You may need to implement a lookup if only movieTitle is present
    return (booking as any).movieId || null;
  }
  getTheatreIdFromBooking(booking: Booking): number | null {
    return (booking as any).theatreId || null;
  }

  confirmCancel(bookingId: number, event: Event): void {
    event.stopPropagation();
    this.selectedBooking = this.bookings.find(b => b.bookingId === bookingId) || null;
    this.showCancelModal = true;
  }

  confirmReschedule(booking: any): void {
    this.selectedBooking = booking;
    this.showRescheduleModal = true;
  }

  onCancelModalConfirm(): void {
    if (this.selectedBooking) {
      this.cancelBooking(this.selectedBooking.bookingId);
    }
    this.closeCancelModal();
  }

  onRescheduleModalConfirm(): void {
    if (this.selectedBooking) {
      this.goToRescheduleShows(this.selectedBooking);
    }
    this.closeRescheduleModal();
  }
}
