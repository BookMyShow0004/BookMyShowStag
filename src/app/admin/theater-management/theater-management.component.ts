import { Component, OnInit } from '@angular/core';
import { TheaterService, Theater } from '../../services/theater.service';
import { City } from '../../services/auth.service';

@Component({
  selector: 'app-theater-management',
  templateUrl: './theater-management.component.html',
  styleUrls: ['./theater-management.component.css']
})
export class TheaterManagementComponent implements OnInit {
  theaterData: Theater = {
    name: '',
    address: '',
    cityId: 0
  };

  cities: City[] = [];
  theaters: Theater[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private theaterService: TheaterService) { }

  ngOnInit(): void {
    this.loadCities();
    this.loadTheaters();
  }

  loadCities(): void {
    this.theaterService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities;
      },
      error: (err) => {
        console.error('Failed to load cities:', err);
        this.errorMessage = 'Failed to load cities. Please try again.';
      }
    });
  }

  loadTheaters(): void {
    this.theaterService.getTheaters().subscribe({
      next: (theaters) => {
        this.theaters = theaters;
      },
      error: (err) => {
        console.error('Failed to load theaters:', err);
        this.errorMessage = 'Failed to load theaters. Please try again.';
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.theaterService.addTheater(this.theaterData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Theater added successfully!';
          this.resetForm();
          this.loadTheaters(); // Refresh the theaters list
        } else {
          this.errorMessage = response.message || 'Failed to add theater';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to add theater. Please try again.';
        console.error('Add theater error:', error);
      }
    });
  }

  validateForm(): boolean {
    if (!this.theaterData.name.trim()) {
      this.errorMessage = 'Theater name is required';
      return false;
    }

    if (!this.theaterData.address.trim()) {
      this.errorMessage = 'Theater address is required';
      return false;
    }

    if (!this.theaterData.cityId || this.theaterData.cityId === 0) {
      this.errorMessage = 'Please select a city';
      return false;
    }

    return true;
  }

  resetForm(): void {
    this.theaterData = {
      name: '',
      address: '',
      cityId: 0
    };
  }

  getCityName(cityId: number): string {
    const city = this.cities.find(c => c.cityId === cityId);
    return city ? city.cityName : 'Unknown City';
  }
} 