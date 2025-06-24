import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService, Seat } from '../services/movie.service';

@Component({
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.css']
})
export class SeatSelectionComponent implements OnInit {
  showId!: number;
  movieId!: number;
  theaterId!: number;
  showTime!: string;
  seats: Seat[] = [];
  selectedSeats: string[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private movieService: MovieService) {}

  ngOnInit(): void {
    this.showId = Number(this.route.snapshot.paramMap.get('showId'));
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
    if (seat.status === 'booked') return;
    if (this.selectedSeats.includes(seat.id)) {
      this.selectedSeats = [];
    } else {
      this.selectedSeats = [seat.id];
    }
  }

  bookSeats(): void {
    alert('Booking seats: ' + this.selectedSeats.join(', '));
    // Implement booking logic here
  }
}
