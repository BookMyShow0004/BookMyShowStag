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
  movies: (Movie & { averageRatingRounded?: number })[] = [];
  filteredMovies: (Movie & { averageRatingRounded?: number })[] = [];
  isLoading: boolean = true;
  currentUser: User | null = null;
  private userSubscription: Subscription | undefined;

  // Search and Filter
  searchQuery: string = '';
  selectedGenre: string = '';
  selectedGenres: string[] = [];
  selectedLanguage: string = '';
  selectedRating: number = 0;
  sortBy: '' | 'name' | 'nameDesc' | 'rating' | 'releaseDate' | 'releaseDateAsc' | 'price' = '';
  showFilters: boolean = false;

  // Booking Modal
  selectedMovie: Movie | null = null;
  private bookingModal: Modal | undefined;

  // Filter options
  genres: string[] = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi'];
  languages: string[] = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];

  // Sidebar
  showSidebar: boolean = false;

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
    // Fetch all movies and all reviews in parallel
    Promise.all([
      this.movieService.getMovies().toPromise(),
      this.movieService.getAllReviews().toPromise()
    ]).then(([movies, reviews]) => {
      if (!movies) return;
      reviews = reviews || [];
      // Group reviews by movieId
      const reviewsByMovie: { [movieId: number]: { rating: number }[] } = {};
      for (const review of reviews) {
        if (!review) continue;
        if (!reviewsByMovie[review.movieId]) reviewsByMovie[review.movieId] = [];
        reviewsByMovie[review.movieId].push(review);
      }
      // Attach average rating to each movie
      const moviesWithRatings = (movies || []).map(movie => {
        if (!movie) return movie;
        const movieReviews = reviewsByMovie[movie.movieId] || [];
        let averageRatingRounded: number | undefined = undefined;
        if (movieReviews.length > 0) {
          const sum = movieReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          averageRatingRounded = Math.round((sum / movieReviews.length) * 10) / 10;
        }
        return { ...movie, averageRatingRounded };
      });
      this.movies = moviesWithRatings;
      this.filteredMovies = moviesWithRatings;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading movies or reviews:', error);
      this.isLoading = false;
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
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query)
      );
    }

    // Genre filter (pattern match: static genre in any part of movie.genre string)
    if (this.selectedGenre) {
      const genrePattern = this.selectedGenre.toLowerCase();
      filtered = filtered.filter(movie =>
        movie.genre && movie.genre.toLowerCase().includes(genrePattern)
      );
    }

    // Language filter (single select)
    if (this.selectedLanguage) {
      filtered = filtered.filter(movie =>
        movie.language && movie.language === this.selectedLanguage
      );
    }

    // Rating filter
    if (this.selectedRating && this.selectedRating > 0) {
      filtered = filtered.filter(movie =>
        movie.averageRatingRounded !== undefined && movie.averageRatingRounded >= this.selectedRating
      );
    }

    this.filteredMovies = filtered;
    this.applySorting();
  }

  applySorting(): void {
    const normalize = (str: string) => str ? str.trim() : '';
    switch (this.sortBy) {
      case 'name':
        this.filteredMovies.sort((a, b) => normalize(a.title).localeCompare(normalize(b.title), undefined, { numeric: true, sensitivity: 'base' }));
        break;
      case 'nameDesc':
        this.filteredMovies.sort((a, b) => normalize(b.title).localeCompare(normalize(a.title), undefined, { numeric: true, sensitivity: 'base' }));
        break;
      case 'rating':
        this.filteredMovies.sort((a, b) => (b.averageRatingRounded ?? 0) - (a.averageRatingRounded ?? 0));
        break;
      case 'releaseDate':
        this.filteredMovies.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case 'releaseDateAsc':
        this.filteredMovies.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      default:
        // No sorting (default order)
        break;
    }
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedGenre = '';
    this.selectedGenres = [];
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
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url, openBookingFor: movie.movieId } });
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

  trackBymovieId(index: number, movie: Movie): number {
    return movie.movieId;
  }

  getFilteredCount(): number {
    return this.filteredMovies.length;
  }

  getTotalCount(): number {
    return this.movies.length;
  }

  private handlePostLoginBooking(movieId: string): void {
    const movieToBook = this.movies.find(m => m.movieId === +movieId);
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

  // List of movies with 4+ rating
  get topRatedMovies(): (Movie & { averageRatingRounded?: number })[] {
    return this.movies.filter(m => (m.averageRatingRounded ?? 0) >= 4);
  }

  getEmptyStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating / 2);
    const emptyStars = 5 - fullStars;
    return Array(emptyStars).fill(0);
  }

  goToMovieDetails(movie: Movie): void {
    this.router.navigate(['/movie', movie.movieId]);
  }

  get allGenres(): string[] {
    return this.genres;
  }

  toggleAllGenres(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedGenres = [];
    }
    this.applyFilters();
  }

  toggleGenre(genre: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedGenres.includes(genre)) {
        this.selectedGenres.push(genre);
      }
    } else {
      this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
    }
    this.applyFilters();
  }
}
