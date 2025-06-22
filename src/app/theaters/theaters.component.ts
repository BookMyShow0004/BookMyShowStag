import { Component, OnInit } from '@angular/core';
import { MovieService, Theater } from '../services/movie.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-theaters',
  templateUrl: './theaters.component.html',
  styleUrls: ['./theaters.component.css']
})
export class TheatersComponent implements OnInit {
  theaters: Theater[] = [];
  filteredTheaters: Theater[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  currentUser: any = null;

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

  constructor(
    private movieService: MovieService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTheaters();
  }

  loadTheaters(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Get user's city or default to Mumbai
    const userCity = this.currentUser?.city || 'Mumbai';
    this.selectedCity = userCity;

    this.movieService.getTheaters(userCity).subscribe({
      next: (theaters) => {
        this.theaters = theaters;
        this.filteredTheaters = theaters;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load theaters';
        this.isLoading = false;
        console.error('Error loading theaters:', error);
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onCityChange(): void {
    this.loadTheaters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applySorting();
  }

  applyFilters(): void {
    let filtered = [...this.theaters];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(theater =>
        theater.name.toLowerCase().includes(query) ||
        theater.location.toLowerCase().includes(query)
      );
    }

    // Amenity filter
    if (this.selectedAmenity) {
      filtered = filtered.filter(theater =>
        theater.amenities.includes(this.selectedAmenity)
      );
    }

    // Rating filter
    if (this.selectedRating > 0) {
      filtered = filtered.filter(theater =>
        theater.rating >= this.selectedRating
      );
    }

    this.filteredTheaters = filtered;
    this.applySorting();
  }

  applySorting(): void {
    this.filteredTheaters.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'location':
          comparison = a.location.localeCompare(b.location);
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedAmenity = '';
    this.selectedRating = 0;
    this.filteredTheaters = [...this.theaters];
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
    return this.filteredTheaters.length;
  }

  getTotalCount(): number {
    return this.theaters.length;
  }
}
