import { Component, OnInit } from '@angular/core';
import { MovieService, Booking } from '../services/movie.service';
import { AuthService } from '../services/auth.service';

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
  currentUser: any = null;

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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBookings();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getActiveBookings(): Booking[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.activeTab === 'upcoming') {
      return this.filteredBookings.filter(b => new Date(b.bookingDate) >= today && b.status !== 'cancelled');
    } else { // past
      return this.filteredBookings.filter(b => new Date(b.bookingDate) < today || b.status === 'cancelled');
    }
  }

  loadBookings(): void {
    if (!this.currentUser) {
      this.errorMessage = 'Please login to view your bookings';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.movieService.getUserBookings(this.currentUser.id).subscribe({
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
        booking.theaterName.toLowerCase().includes(query) ||
        booking.bookingCode.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(booking => booking.status === this.selectedStatus);
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
        const bookingDate = new Date(booking.bookingDate);
        
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
    this.newShowTime = booking.showTime;
    this.newDate = booking.bookingDate;
    this.showRescheduleModal = true;
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal = false;
    this.selectedBooking = null;
    this.newShowTime = '';
    this.newDate = '';
  }

  cancelBooking(): void {
    if (!this.selectedBooking) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.movieService.cancelBooking(this.selectedBooking.id).subscribe({
      next: (response) => {
        this.isProcessing = false;
        if (response.success) {
          this.successMessage = response.message;
          this.closeCancelModal();
          this.loadBookings(); // Refresh bookings
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isProcessing = false;
        this.errorMessage = 'Failed to cancel booking';
        console.error('Error cancelling booking:', error);
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
      this.selectedBooking.id,
      this.newShowTime,
      this.newDate
    ).subscribe({
      next: (response) => {
        this.isProcessing = false;
        if (response.success) {
          this.successMessage = response.message;
          this.closeRescheduleModal();
          this.loadBookings(); // Refresh bookings
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

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'confirmed': '#4caf50',
      'cancelled': '#f44336',
      'completed': '#2196f3'
    };
    return colors[status] || '#666';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'confirmed': 'fas fa-check-circle',
      'cancelled': 'fas fa-times-circle',
      'completed': 'fas fa-flag-checkered'
    };
    return icons[status] || 'fas fa-circle';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    return time;
  }

  getSeatsText(seats: string[]): string {
    if (seats.length === 1) {
      return `Seat ${seats[0]}`;
    }
    return `Seats ${seats.join(', ')}`;
  }

  canCancel(booking: Booking): boolean {
    return booking.status === 'confirmed';
  }

  canReschedule(booking: Booking): boolean {
    return booking.status === 'confirmed';
  }

  getFilteredCount(): number {
    return this.filteredBookings.length;
  }

  getTotalCount(): number {
    return this.bookings.length;
  }

  getStatusCount(status: string): number {
    return this.bookings.filter(booking => booking.status === status).length;
  }
}
