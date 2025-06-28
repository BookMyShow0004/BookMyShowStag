import { Component, OnInit } from '@angular/core';
import { MovieService, Theatre, Seat } from '../services/movie.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-theatres',
  templateUrl: './theatres.component.html',
  styleUrls: ['./theatres.component.css']
})
export class TheatresComponent implements OnInit {
  theatres: Theatre[] = [];
  filteredTheatres: Theatre[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  currentUser: any = null;
  movieId: number | null = null;
  cityId: number | null = null;
  movieTitle: string | null = null;

  // Search and Filter
  searchQuery: string = '';
  selectedCity: string = '';
  selectedAmenity: string = '';
  selectedRating: number = 0;

  // Filter options
  cities: string[] = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
  amenities: string[] = ['Dolby Atmos', 'Recliner Seats', 'Food Service', 'Online Booking', 'Dolby Digital', 'Premium Seats', 'Snack Bar'];
  ratingOptions: number[] = [4.5, 4.0, 3.5, 3.0];

  // UI States
  showFilters: boolean = false;
  sortBy: 'name' | 'rating' | 'location' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Showtime and Seat selection
  selectedShow: { theatreId: number, showTime: string } | null = null;
  showSeats: Seat[] = [];
  showSeatPrices: { [seatId: number]: number } = {};

  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private authService: AuthService,
    private router: Router
  ) { }

  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.movieId = Number(this.route.snapshot.paramMap.get('id'));
    this.cityId = this.route.snapshot.paramMap.get('cityId') ? Number(this.route.snapshot.paramMap.get('cityId')) : null;
    if (this.movieId) {
      this.movieService.getMovieById(this.movieId).subscribe({
        next: (movie) => {
          this.movieTitle = movie.title;
        },
        error: () => {
          this.movieTitle = null;
          this.showToastMessage('Failed to load movie details.', 'error');
        }
      });
    }
    this.loadTheatres();
  }

  loadTheatres(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const movieId = this.movieId;
    const cityId = this.cityId;
    if (movieId && cityId) {
      this.movieService.getTheatresByMovieId(movieId, cityId).subscribe({
        next: (theatres: Theatre[]) => {
          let loadedCount = 0;
          if (theatres.length === 0) {
            this.theatres = [];
            this.filteredTheatres = [];
            this.isLoading = false;
            return;
          }
          theatres.forEach((theatre, idx) => {
            this.movieService.getShowTimeByMovieAndTheatre(movieId, theatre.theatreId).subscribe({
              next: (shows: any[]) => {
                theatre.showTimes = shows.map(show => new Date(show.showDateTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
                loadedCount++;
                if (loadedCount === theatres.length) {
                  this.theatres = theatres;
                  this.filteredTheatres = theatres;
                  this.isLoading = false;
                }
              },
              error: () => {
                theatre.showTimes = [];
                loadedCount++;
                if (loadedCount === theatres.length) {
                  this.theatres = theatres;
                  this.filteredTheatres = theatres;
                  this.isLoading = false;
                }
                this.showToastMessage('Failed to load showtimes.', 'error');
              }
            });
          });
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to load theatres';
          this.isLoading = false;
          this.showToastMessage(this.errorMessage, 'error');
        }
      });
    } else {
      this.errorMessage = 'Movie and City are required to load theatres.';
      this.isLoading = false;
      this.showToastMessage(this.errorMessage, 'error');
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  onCityChange(): void {
    this.loadTheatres();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applySorting();
  }

  onShowtimeClick(theatre: Theatre, showTime: string): void {
    this.selectedShow = { theatreId: theatre.theatreId, showTime };
    this.showSeats = [];
    this.showSeatPrices = {};
    if (this.movieId) {
      this.movieService.getSeatsForShow(this.movieId, theatre.theatreId, showTime).subscribe({
        next: (seats) => {
          this.showSeats = seats;
          // If price is available in seat object, map it; else, set a default
          seats.forEach(seat => {
            this.showSeatPrices[seat.seatId] = (seat as any).price || 200; // Default price if not present
          });
        },
        error: () => {
          this.showSeats = [];
        }
      });
    }
  }

  applyFilters(): void {
    let filtered = [...this.theatres];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(theatre =>
        theatre.name.toLowerCase().includes(query) ||
        theatre.address.toLowerCase().includes(query)
      );
    }

    // Amenity filter
    if (this.selectedAmenity) {
      filtered = filtered.filter(theatre =>
        theatre.amenities.includes(this.selectedAmenity)
      );
    }

    // Rating filter
    if (this.selectedRating > 0) {
      filtered = filtered.filter(theatre =>
        theatre.rating >= this.selectedRating
      );
    }

    this.filteredTheatres = filtered;
    this.applySorting();
  }

  applySorting(): void {
    this.filteredTheatres.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'location':
          comparison = a.address.localeCompare(b.address);
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedAmenity = '';
    this.selectedRating = 0;
    this.filteredTheatres = [...this.theatres];
    this.applySorting();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getStarRating(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getAmenityIcon(amenity: string): string {
    const icons: { [key: string]: string } = {
      'Dolby Atmos': 'fas fa-volume-up',
      'Recliner Seats': 'fas fa-chair',
      'Food Service': 'fas fa-utensils',
      'Online Booking': 'fas fa-ticket-alt',
      'Dolby Digital': 'fas fa-volume-up',
      'Premium Seats': 'fas fa-star',
      'Snack Bar': 'fas fa-coffee'
    };
    return icons[amenity] || 'fas fa-check';
  }

  getAmenityColor(amenity: string): string {
    const colors: { [key: string]: string } = {
      'Dolby Atmos': '#667eea',
      'Recliner Seats': '#4ecdc4',
      'Food Service': '#feca57',
      'Online Booking': '#ff6b6b',
      'Dolby Digital': '#667eea',
      'Premium Seats': '#ff9ff3',
      'Snack Bar': '#54a0ff'
    };
    return colors[amenity] || '#667eea';
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#4caf50';
    if (rating >= 4.0) return '#8bc34a';
    if (rating >= 3.5) return '#ffc107';
    if (rating >= 3.0) return '#ff9800';
    return '#f44336';
  }

  getFilteredCount(): number {
    return this.filteredTheatres.length;
  }

  getTotalCount(): number {
    return this.theatres.length;
  }

  goToShowList(theatre: any): void {
    const movieId = Number(this.route.snapshot.paramMap.get('id'));
    this.router.navigate(['/shows', movieId, theatre.theatreId]);
  }

  goBack() {
    window.history.back();
  }
}
