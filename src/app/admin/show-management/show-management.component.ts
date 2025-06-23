import { Component, OnInit } from '@angular/core';
import { ShowService, Show, Movie, Theater } from '../../services/show.service';

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
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private showService: ShowService) { }

  ngOnInit(): void {
    this.loadMovies();
    this.loadTheaters();
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

  onSubmit(): void {
    if (!this.validateForm()) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showService.addShow(this.showData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Show added successfully!';
          this.resetForm();
        } else {
          this.errorMessage = response.message || 'Failed to add show';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to add show. Please try again.';
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
} 