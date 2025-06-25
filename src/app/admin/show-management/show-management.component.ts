import { Component, OnInit } from '@angular/core';
import { ShowService, Show, Movie, Theater, ShowApi } from '../../services/show.service';

@Component({
  selector: 'app-show-management',
  templateUrl: './show-management.component.html',
  styleUrls: ['./show-management.component.css']
})
export class ShowManagementComponent implements OnInit {
  showData: Show = {
    movieId: 0,
    theatreId: 0,
    showDateTime: '',
    ticketPrice: 0
  };

  movies: Movie[] = [];
  theaters: Theater[] = [];
  shows: ShowApi[] = [];
  editingShow: Show | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private showService: ShowService) { }

  ngOnInit(): void {
    this.loadMovies();
    this.loadTheaters();
    this.loadShows();
  }

  loadMovies(): void {
    this.showService.getMovies().subscribe({
      next: (movies) => { this.movies = movies; },
      error: (err) => { this.errorMessage = 'Failed to load movies.'; }
    });
  }

  loadTheaters(): void {
    this.showService.getTheaters().subscribe({
      next: (theaters) => { this.theaters = theaters; },
      error: (err) => { this.errorMessage = 'Failed to load theaters.'; }
    });
  }

  loadShows(): void {
    this.showService.getAllShows().subscribe({
      next: (shows) => {
        // Filter out shows that do not have showId or showDateTime
        this.shows = (shows || []).filter(s => s.showId && s.showDateTime);
      },
      error: () => { this.errorMessage = 'Failed to load shows.'; }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.editingShow) {
      // Update show
      this.showService.updateShow(this.editingShow.showId!, this.showData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Show updated successfully!';
          this.resetForm();
          this.loadShows();
          this.editingShow = null;
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to update show.';
        }
      });
    } else {
      this.showService.addShow(this.showData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = 'Show added successfully!';
            this.resetForm();
            this.loadShows();
          } else {
            this.errorMessage = response.message || 'Failed to add show';
          }
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to add show. Please try again.';
        }
      });
    }
  }

  editShow(show: ShowApi): void {
    this.showData = {
      movieId: show.movieId ?? 0,
      theatreId: show.theatreId ?? 0,
      showDateTime: show.showDateTime,
      ticketPrice: show.ticketPrice
    };
    this.editingShow = show as any;
  }

  deleteShow(show: ShowApi): void {
    if (!show.showId) return;
    if (!confirm('Are you sure you want to delete this show?')) return;
    this.showService.deleteShow(show.showId).subscribe({
      next: () => {
        this.successMessage = 'Show deleted successfully!';
        // Remove the deleted show from the local array immediately
        this.shows = this.shows.filter(s => s.showId !== show.showId);
        // Optionally, reload from server for consistency
        setTimeout(() => this.loadShows(), 500);
      },
      error: () => {
        this.errorMessage = 'Failed to delete show.';
      }
    });
  }

  validateForm(): boolean {
    if (!this.showData.movieId) {
      this.errorMessage = 'Please select a movie';
      return false;
    }
    if (!this.showData.theatreId) {
      this.errorMessage = 'Please select a theater';
      return false;
    }
    if (!this.showData.showDateTime) {
      this.errorMessage = 'Please select a show date and time';
      return false;
    }
    if (!this.showData.ticketPrice || this.showData.ticketPrice <= 0) {
      this.errorMessage = 'Please enter a valid ticket price';
      return false;
    }
    return true;
  }

  resetForm(): void {
    this.showData = {
      movieId: 0,
      theatreId: 0,
      showDateTime: '',
      ticketPrice: 0
    };
  }

  getMovieTitle(movieId: number): string {
    const movie = this.movies.find(m => m.movieId === movieId);
    return movie ? movie.title : movieId.toString();
  }

  getTheaterName(theatreId: number): string {
    const theater = this.theaters.find(t => t.theatreId === theatreId);
    return theater ? theater.name : theatreId.toString();
  }

  getMovieTitleByShow(show: ShowApi): string {
    if (show.movieTitle) return show.movieTitle;
    if (show.movieId) {
      const movie = this.movies.find(m => m.movieId === show.movieId);
      return movie ? movie.title : show.movieId.toString();
    }
    return '';
  }

  getTheaterNameByShow(show: ShowApi): string {
    if (show.theatreName) return show.theatreName;
    if (show.theatreId) {
      const theater = this.theaters.find(t => t.theatreId === show.theatreId);
      return theater ? theater.name : show.theatreId.toString();
    }
    return '';
  }
}