import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Movie, Theater, MovieService } from '../services/movie.service';

interface Seat {
  id: string;
  status: 'available' | 'selected' | 'booked';
}

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

  seats: Seat[] = [];
  selectedSeats: Seat[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    // Theaters would typically be fetched based on movie and location
    // For this demo, we'll get them from the movie object or a service
    if (this.movie) {
      this.theaters = this.movie.theaters;
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
    this.selectedShowtime = null; // Reset showtime when theater changes
    this.seats = [];
  }

  selectShowtime(time: string): void {
    this.selectedShowtime = time;
    this.generateSeats();
  }

  generateSeats(): void {
    // In a real app, you'd get seat availability from a service
    this.seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const cols = 12;
    for (const row of rows) {
      for (let i = 1; i <= cols; i++) {
        const id = `${row}${i}`;
        // Mock some seats as booked
        const isBooked = Math.random() < 0.2;
        this.seats.push({
          id,
          status: isBooked ? 'booked' : 'available'
        });
      }
    }
  }

  toggleSeat(seat: Seat): void {
    if (seat.status === 'booked') {
      return;
    }
    if (seat.status === 'available') {
      seat.status = 'selected';
      this.selectedSeats.push(seat);
    } else if (seat.status === 'selected') {
      seat.status = 'available';
      this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
    }
  }

  confirmBooking(): void {
    if (this.selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }
    // Logic to proceed with booking confirmation
    console.log('Booking confirmed for:', this.selectedSeats);
    // Emit event to parent
    this.bookingComplete.emit();
    this.resetState();
  }
}
