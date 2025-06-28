import { Component, OnInit } from '@angular/core';
import { CityService, City } from '../../services/city.service';

@Component({
  selector: 'app-city-management',
  templateUrl: './city-management.component.html',
  styleUrls: ['./city-management.component.css']
})
export class CityManagementComponent implements OnInit {
  cityData: Partial<City> = { cityName: '' };
  cities: City[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  editingCity: City | null = null;

  constructor(private cityService: CityService) {}

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    this.isLoading = true;
    this.cityService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load cities.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.editingCity) {
     
      this.cityService.updateCity({ ...this.editingCity, ...this.cityData } as City).subscribe({
        next: () => {
          this.successMessage = 'City updated successfully!';
          this.cityData = { cityName: '' };
          this.editingCity = null;
          this.loadCities();
        },
        error: () => {
          this.errorMessage = 'Failed to update city.';
        }
      });
    } else {
      
      this.cityService.addCity(this.cityData).subscribe({
        next: () => {
          this.successMessage = 'City added successfully!';
          this.cityData = { cityName: '' };
          this.loadCities();
        },
        error: () => {
          this.errorMessage = 'Failed to add city.';
        }
      });
    }
  }

  onEdit(city: City): void {
    this.editingCity = { ...city };
    this.cityData = { cityName: city.cityName };
  }

  onDelete(city: City): void {
    if (confirm('Are you sure you want to delete this city?')) {
      this.cityService.deleteCity(city.cityId).subscribe({
        next: () => {
          this.successMessage = 'City deleted successfully!';
          this.loadCities();
        },
        error: () => {
          this.errorMessage = 'Failed to delete city.';
        }
      });
    }
  }

  onCancelEdit(): void {
    this.editingCity = null;
    this.cityData = { cityName: '' };
  }
}
