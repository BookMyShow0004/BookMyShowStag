import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../shared/alert.service';
import { SeatService, Seat } from '../../services/seat.service';
import { ShowService } from '../../services/show.service';
import { MovieService, Movie, Theatre } from '../../services/movie.service';
import { ShowSeatService } from '../../services/show-seat.service';
import { switchMap, filter, tap } from 'rxjs/operators';

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
  theatres: Theatre[] = [];
  isSeatsLoading = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private alertService: AlertService,
    private seatService: SeatService,
    private showService: ShowService,
    private movieService: MovieService,
    private showSeatService: ShowSeatService
  ) {
    this.seatForm = this.fb.group({
      showId: ['', Validators.required],
      seatId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchShowSeats();
    this.showService.getAllShows().subscribe({
      next: (shows) => {
        this.shows = (shows || []).filter(s => s.showId && s.showDateTime);
      }
    });
    this.movieService.getMovies().subscribe({
      next: (movies) => { this.movies = movies; }
    });
    this.movieService.getTheatres('').subscribe({
      next: (theatres) => { this.theatres = theatres; }
    });
    // Use switchMap to handle rapid showId changes and avoid race conditions
    this.seatForm.get('showId')?.valueChanges.pipe(
      tap(() => {
        this.filteredSeats = [];
        this.isSeatsLoading = true;
        this.seatForm.get('seatId')?.disable();
      }),
      filter(showId => !!showId),
      switchMap((showId) => {
        const show = this.shows.find(s => s.showId == showId);
        let theatreId = show?.theatreId;
        if (!theatreId && show?.theatreName) {
          const theatre = this.theatres.find(t => t.name === show.theatreName);
          theatreId = theatre?.theatreId;
        }
        if (theatreId) {
          return this.seatService.getAllSeatsByTheatre(theatreId);
        } else {
          this.isSeatsLoading = false;
          this.seatForm.get('seatId')?.enable();
          return [];
        }
      })
    ).subscribe({
      next: (seats: any) => {
        this.filteredSeats = seats || [];
        this.seatTypes = Array.from(new Set((seats || []).map((s: any) => s.seatType)));
        this.isSeatsLoading = false;
        this.seatForm.get('seatId')?.enable();
        this.seatForm.patchValue({ seatId: '' });
      },
      error: (err) => {
        this.filteredSeats = [];
        this.isSeatsLoading = false;
        this.seatForm.get('seatId')?.enable();
      }
    });
  }

  fetchShowSeats(): void {
    this.isLoading = true;
    this.showSeatService.getAllShowSeats().subscribe({
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
    this.editingSeatId = seat.showSeatId;
    // Patch both showId and seatId immediately
    this.seatForm.patchValue({
      showId: seat.showId,
      seatId: seat.seatId
    });
    // Find the show and theatreId
    const show = this.shows.find(s => s.showId == seat.showId);
    let theatreId = show?.theatreId;
    if (!theatreId && show?.theatreName) {
      const theatre = this.theatres.find(t => t.name === show.theatreName);
      theatreId = theatre?.theatreId;
    }
    // If the seat is already in the dropdown, do nothing more
    if (this.filteredSeats.some(s => s.seatId === seat.seatId)) {
      return;
    }
    // Otherwise, fetch the seats for the show and patch seatId after loading
    if (theatreId) {
      this.isSeatsLoading = true;
      this.seatForm.get('seatId')?.disable();
      this.seatService.getAllSeatsByTheatre(theatreId).subscribe({
        next: (seats) => {
          this.filteredSeats = seats;
          this.seatTypes = Array.from(new Set(seats.map((s: any) => s.seatType)));
          this.isSeatsLoading = false;
          this.seatForm.get('seatId')?.enable();
          // Patch seatId again after seats are loaded
          this.seatForm.patchValue({ seatId: seat.seatId });
        },
        error: () => {
          this.filteredSeats = [];
          this.isSeatsLoading = false;
          this.seatForm.get('seatId')?.enable();
        }
      });
    } else {
      this.filteredSeats = [];
      this.seatForm.get('seatId')?.enable();
    }
  }

  deleteShowSeat(seat: any): void {
    if (!confirm('Are you sure you want to delete this show seat?')) return;
    this.showSeatService.deleteShowSeat(seat.showSeatId).subscribe({
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
    // Only pass showId and seatId to the API
    const seatData = {
      showId: this.seatForm.value.showId,
      seatId: this.seatForm.value.seatId
    };
    if (this.editingSeatId) {
      // Update existing seat
      this.showSeatService.updateShowSeat(this.editingSeatId, seatData).subscribe({
        next: () => {
          this.alertService.showAlert('Show seat updated successfully!');
          this.seatForm.reset();
          this.editingSeatId = null;
          this.fetchShowSeats();
        },
        error: (error) => {
          this.alertService.showAlert('Failed to update show seat.');
        }
      });
    } else {
      // Create new seat
      this.showSeatService.createShowSeat(seatData).subscribe({
        next: () => {
          this.alertService.showAlert('Show seat created successfully!');
          this.seatForm.reset();
          this.fetchShowSeats();
        },
        error: (error) => {
          console.log(error)
          this.alertService.showAlert('Failed to create show seat.');
        }
      });
    }
  }

  // Remove seat fetching logic from onShowChange, keep only patchValue and logs
  onShowChange(): void {
    const showId = this.seatForm.value.showId;
    const show = this.shows.find(s => s.showId == showId);
    console.log('onShowChange called. showId:', showId, 'show:', show);
    let theatreId = show?.theatreId;
    if (!theatreId && show?.theatreName) {
      const theatre = this.theatres.find(t => t.name === show.theatreName);
      theatreId = theatre?.theatreId;
      console.log('Looked up theatreId from theatreName:', theatreId);
    }
    console.log('TheatreId:', theatreId);
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

  getTheatreNameByShow(show: any): string {
    // Try to get theatreId from show, fallback to theatreName
    let theatreId = show.theatreId;
    let theatreName = show.theatreName;
    if (!theatreName && theatreId) {
      const theatre = this.theatres.find(t => t.theatreId === theatreId);
      theatreName = theatre ? theatre.name : '';
    }
    // If still not found, try to match by show.showId in shows array
    if (!theatreName && show.showId) {
      const showObj = this.shows.find(s => s.showId === show.showId);
      if (showObj) {
        if (showObj.theatreName) return showObj.theatreName;
        if (showObj.theatreId) {
          const theatre = this.theatres.find(t => t.theatreId === showObj.theatreId);
          if (theatre) return theatre.name;
        }
      }
    }
    return theatreName || '';
  }

  getSeatLabel(seat: any): string {
    let label = `Seat: ${seat.seatId}`;
    const details: string[] = [];
    if (seat.seatNumber) details.push(`Number: ${seat.seatNumber}`);
    if (seat.seatType) details.push(`Type: ${seat.seatType}`);
    // Add theatre name or theatreId
    let theatreName = '';
    if (seat.theatreId || seat.theatreId) {
      const tid = seat.theatreId || seat.theatreId;
      const theatre = this.theatres.find(t => t.theatreId === tid);
      theatreName = theatre ? theatre.name : tid;
    }
    if (theatreName) details.push(`Theatre: ${theatreName}`);
    if (details.length) label += ` (${details.join(', ')})`;
    return label;
  }
}
