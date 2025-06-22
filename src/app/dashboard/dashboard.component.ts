import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { MovieService, Movie } from '../services/movie.service';
import { AuthService, User } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  suggestedMovies: Movie[] = [];
  filteredMovies: Movie[] = [];
  isLoading: boolean = true;
  currentUser: User | null = null;
  private userSubscription: Subscription | undefined;

  // Search and Filter
  searchQuery: string = '';
  selectedGenre: string = '';
  selectedLanguage: string = '';
  selectedRating: number = 0;
  sortBy: 'name' | 'rating' | 'releaseDate' | 'price' = 'name';
  showFilters: boolean = false;

  // Booking Modal
  selectedMovie: Movie | null = null;
  private bookingModal: Modal | undefined;

  // Filter options
  genres: string[] = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi'];
  languages: string[] = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];

  constructor(
    private movieService: MovieService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadMovies();

    this.route.queryParams.subscribe(params => {
      const movieId = params['openBookingFor'];
      if (movieId && this.currentUser) {
        this.handlePostLoginBooking(movieId);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  loadMovies(): void {
    this.isLoading = true;
    
    this.movieService.getMovies().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.suggestedMovies = movies.filter(movie => movie.isSuggested);
        this.filteredMovies = movies;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applySorting();
  }

  applyFilters(): void {
    let filtered = [...this.movies];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query) ||
        movie.genre.toLowerCase().includes(query)
      );
    }

    // Genre filter
    if (this.selectedGenre) {
      filtered = filtered.filter(movie => movie.genre === this.selectedGenre);
    }

    // Language filter
    if (this.selectedLanguage) {
      filtered = filtered.filter(movie => movie.language === this.selectedLanguage);
    }

    // Rating filter
    if (this.selectedRating > 0) {
      filtered = filtered.filter(movie => movie.rating >= this.selectedRating);
    }

    this.filteredMovies = filtered;
    this.applySorting();
  }

  applySorting(): void {
    this.filteredMovies.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
        case 'releaseDate':
          comparison = new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
      }

      return comparison;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedGenre = '';
    this.selectedLanguage = '';
    this.selectedRating = 0;
    this.filteredMovies = [...this.movies];
    this.applySorting();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  openBookingModal(movie: Movie): void {
    if (!this.currentUser) {
      // Redirect to login if user is not authenticated, passing return URL
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url, openBookingFor: movie.id } });
      return;
    }
    
    this.selectedMovie = movie;
    const modalElement = this.elementRef.nativeElement.querySelector('#bookingModal');
    if (modalElement) {
      this.bookingModal = new Modal(modalElement);
      this.bookingModal.show();
    }
  }

  closeBookingModal(): void {
    if (this.bookingModal) {
      this.bookingModal.hide();
    }
    this.selectedMovie = null;
    // Clear query params after closing modal
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { openBookingFor: null },
      queryParamsHandling: 'merge',
    });
  }

  onBookingComplete(): void {
    this.closeBookingModal();
    // Optionally refresh movies or show success message
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  trackByMovieId(index: number, movie: Movie): number {
    return movie.id;
  }

  getFilteredCount(): number {
    return this.filteredMovies.length;
  }

  getTotalCount(): number {
    return this.movies.length;
  }

  private handlePostLoginBooking(movieId: string): void {
    const movieToBook = this.movies.find(m => m.id === +movieId);
    if (movieToBook) {
      // Use a timeout to ensure the view is stable before opening the modal
      setTimeout(() => {
        this.openBookingModal(movieToBook);
      }, 0);
    }
  }

  getStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating / 2);
    return Array(fullStars).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating / 2);
    const emptyStars = 5 - fullStars;
    return Array(emptyStars).fill(0);
  }
}
