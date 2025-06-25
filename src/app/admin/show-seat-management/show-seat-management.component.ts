import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../shared/alert.service';
import { SeatService, Seat } from '../../services/seat.service';
import { ShowService } from '../../services/show.service';
import { MovieService, Movie, Theater } from '../../services/movie.service';

@Component({
  selector: 'app-show-seat-management',
  templateUrl: './show-seat-management.component.html',
  styleUrls: ['./show-seat-management.component.css']
})
export class ShowSeatManagementComponent implements OnInit {
  showSeats: any[] = [];
  isLoading = false;
  errorMessage = '';
  seatForm: FormGroup;
  editingSeatId: number | null = null;
  seatTypes: string[] = [];
  shows: any[] = [];
  seats: any[] = [];
  filteredSeats: any[] = [];
  movies: Movie[] = [];
  theaters: Theater[] = [];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private alertService: AlertService,
    private seatService: SeatService,
    private showService: ShowService,
    private movieService: MovieService
  ) {
    this.seatForm = this.fb.group({
      showId: ['', Validators.required],
      seatId: ['', Validators.required],
      seatType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchShowSeats();
    this.seatService.getAllSeats().subscribe({
      next: (seats) => {
        this.seatTypes = Array.from(new Set(seats.map(s => s.seatType)));
        this.seats = seats;
        this.filteredSeats = seats; // Default to all seats
      }
    });
    this.showService.getAllShows().subscribe({
      next: (shows) => {
        this.shows = (shows || []).filter(s => s.showId && s.showDateTime);
      }
    });
    this.movieService.getMovies().subscribe({
      next: (movies) => { this.movies = movies; }
    });
    this.movieService.getTheaters('').subscribe({
      next: (theaters) => { this.theaters = theaters; }
    });
  }

  fetchShowSeats(): void {
    this.isLoading = true;
    this.http.get<any[]>('https://vb7dqrjl-5069.inc1.devtunnels.ms/api/ShowSeats').subscribe({
      next: (data) => {
        this.showSeats = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load show seats.';
        this.isLoading = false;
      }
    });
  }

  editShowSeat(seat: any): void {
    this.seatForm.patchValue({
      showId: seat.showId,
      seatId: seat.seatId
    });
    this.editingSeatId = seat.showSeatId;
  }

  deleteShowSeat(seat: any): void {
    if (!confirm('Are you sure you want to delete this show seat?')) return;
    this.http.delete(`https://vb7dqrjl-5069.inc1.devtunnels.ms/api/ShowSeats/${seat.showSeatId}`).subscribe({
      next: () => {
        this.alertService.showAlert('Show seat deleted successfully!');
        this.fetchShowSeats();
      },
      error: () => {
        this.alertService.showAlert('Failed to delete show seat.');
      }
    });
  }

  createShowSeat(): void {
    if (this.seatForm.invalid) return;
    const seatData = {
      showId: this.seatForm.value.showId,
      seatId: this.seatForm.value.seatId
    };
    if (this.editingSeatId) {
      // Update existing seat
      this.http.put(`https://vb7dqrjl-5069.inc1.devtunnels.ms/api/ShowSeats/${this.editingSeatId}`, seatData).subscribe({
        next: () => {
          this.alertService.showAlert('Show seat updated successfully!');
          this.seatForm.reset();
          this.editingSeatId = null;
          this.fetchShowSeats();
        },
        error: () => {
          this.alertService.showAlert('Failed to update show seat.');
        }
      });
    } else {
      // Create new seat
      this.http.post('https://vb7dqrjl-5069.inc1.devtunnels.ms/api/ShowSeats', seatData).subscribe({
        next: () => {
          this.alertService.showAlert('Show seat created successfully!');
          this.seatForm.reset();
          this.fetchShowSeats();
        },
        error: () => {
          this.alertService.showAlert('Failed to create show seat.');
        }
      });
    }
  }

  onShowChange(): void {
    const showId = this.seatForm.value.showId;
    const show = this.shows.find(s => s.showId == showId);
    console.log('Selected show:', show);
    const theatreId = show?.theatreId || show?.theaterId;
    if (theatreId) {
      this.filteredSeats = this.seats.filter(seat => {
        // Log each seat for debugging
        console.log('Checking seat:', seat);
        return seat.theatreId == theatreId || seat.theaterId == theatreId;
      });
      console.log('Filtered seats:', this.filteredSeats);
    } else {
      this.filteredSeats = this.seats;
      console.log('No theatreId found, showing all seats.');
    }
    this.seatForm.patchValue({ seatId: '' }); // Reset seat selection
  }

  getMovieTitleByShow(show: any): string {
    if (show.movieTitle) return show.movieTitle;
    if (show.movieId) {
      const movie = this.movies.find(m => m.movieId === show.movieId);
      return movie ? movie.title : show.movieId.toString();
    }
    return '';
  }

  getTheaterNameByShow(show: any): string {
    if (show.theatreName) return show.theatreName;
    if (show.theatreId) {
      const theater = this.theaters.find(t => t.theatreId === show.theatreId);
      return theater ? theater.name : show.theatreId.toString();
    }
    return '';
  }

  getSeatLabel(seat: any): string {
    let label = `Seat: ${seat.seatId}`;
    const details: string[] = [];
    if (seat.seatNumber) details.push(`Number: ${seat.seatNumber}`);
    if (seat.seatType) details.push(`Type: ${seat.seatType}`);
    // Add theater name or theaterId
    let theaterName = '';
    if (seat.theatreId || seat.theaterId) {
      const tid = seat.theatreId || seat.theaterId;
      const theater = this.theaters.find(t => t.theatreId === tid);
      theaterName = theater ? theater.name : tid;
    }
    if (theaterName) details.push(`Theater: ${theaterName}`);
    if (details.length) label += ` (${details.join(', ')})`;
    return label;
  }
}
