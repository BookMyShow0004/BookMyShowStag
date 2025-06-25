import { Component, OnInit } from '@angular/core';
import { ShowService, Show, Movie, Theatre, ShowApi } from '../../services/show.service';

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
  theatres: Theatre[] = [];
  shows: ShowApi[] = [];
  editingShow: Show | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private showService: ShowService) { }

  ngOnInit(): void {
    this.loadMovies();
    this.loadTheatres();
    this.loadShows();
  }

  loadMovies(): void {
    this.showService.getMovies().subscribe({
      next: (movies) => { this.movies = movies; },
      error: (err) => { this.errorMessage = 'Failed to load movies.'; }
    });
  }

  loadTheatres(): void {
    this.showService.getTheatres().subscribe({
      next: (theatres) => { this.theatres = theatres; },
      error: (err) => { this.errorMessage = 'Failed to load theatres.'; }
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
    // Wait for movies and theatres to be loaded before setting showData
    if (!this.movies.length || !this.theatres.length) {
      Promise.all([
        new Promise<void>(resolve => this.showService.getMovies().subscribe(movies => { this.movies = movies; resolve(); })),
        new Promise<void>(resolve => this.showService.getTheatres().subscribe(theatres => { this.theatres = theatres; resolve(); }))
      ]).then(() => {
        this.setShowDataForEdit(show);
      });
    } else {
      this.setShowDataForEdit(show);
    }
  }

  setShowDataForEdit(show: ShowApi): void {
    // Fallback: find movieId/theatreId from title/name if missing
    let movieId = show.movieId;
    if (!movieId && show.movieTitle) {
      const movie = this.movies.find(m => m.title === show.movieTitle);
      movieId = movie ? movie.movieId : 0;
    }
    let theatreId = show.theatreId;
    if (!theatreId && show.theatreName) {
      const theatre = this.theatres.find(t => t.name === show.theatreName);
      theatreId = theatre ? theatre.theatreId : 0;
    }
    this.editingShow = {
      showId: show.showId,
      movieId: movieId ?? 0,
      theatreId: theatreId ?? 0,
      showDateTime: show.showDateTime,
      ticketPrice: show.ticketPrice
    };
    this.showData = {
      showId: show.showId,
      movieId: movieId ?? 0,
      theatreId: theatreId ?? 0,
      showDateTime: this.formatDateTimeForInput(show.showDateTime),
      ticketPrice: show.ticketPrice
    };
    setTimeout(() => {
      this.showData = { ...this.showData };
    }, 0);
  }

  formatDateTimeForInput(dateTime: string): string {
    // Converts ISO string or date string to yyyy-MM-ddTHH:mm for input[type=datetime-local]
    const date = new Date(dateTime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
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
      this.errorMessage = 'Please select a theatre';
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

  getTheatreName(theatreId: number): string {
    const theatre = this.theatres.find(t => t.theatreId === theatreId);
    return theatre ? theatre.name : theatreId.toString();
  }

  getMovieTitleByShow(show: ShowApi): string {
    if (show.movieTitle) return show.movieTitle;
    if (show.movieId) {
      const movie = this.movies.find(m => m.movieId === show.movieId);
      return movie ? movie.title : show.movieId.toString();
    }
    return '';
  }

  getTheatreNameByShow(show: ShowApi): string {
    if (show.theatreName) return show.theatreName;
    if (show.theatreId) {
      const theatre = this.theatres.find(t => t.theatreId === show.theatreId);
      return theatre ? theatre.name : show.theatreId.toString();
    }
    return '';
  }
}