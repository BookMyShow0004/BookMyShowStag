import { Component, OnInit } from '@angular/core';
import { TheatreService, Theatre } from '../../services/theatre.service';
import { City } from '../../services/auth.service';

@Component({
  selector: 'app-theatre-management',
  templateUrl: './theatre-management.component.html',
  styleUrls: ['./theatre-management.component.css']
})
export class TheatreManagementComponent implements OnInit {
  theatreData: Theatre = {
    name: '',
    address: '',
    cityId: 0
  };

  cities: City[] = [];
  theatres: Theatre[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  editingTheatre: Theatre | null = null;

  constructor(private theatreService: TheatreService) { }

  ngOnInit(): void {
    this.loadCities();
    this.loadTheatres();
  }

  loadCities(): void {
    this.theatreService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities;
      },
      error: (err) => {
        console.error('Failed to load cities:', err);
        this.errorMessage = 'Failed to load cities. Please try again.';
      }
    });
  }

  loadTheatres(): void {
    this.theatreService.getTheatres().subscribe({
      next: (theatres) => {
        console.log('Loaded theatres:', theatres);
         this.theatres = [...theatres];
      },
      error: (err) => {
        console.error('Failed to load theatres:', err);
        this.errorMessage = 'Failed to load theatres. Please try again.';
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

    this.theatreService.addTheatre(this.theatreData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Theatre added successfully!';
          this.resetForm();
           this.loadTheatres(); 
        } else {
          this.errorMessage = response.message || 'Failed to add theatre';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to add theatre. Please try again.';
        console.error('Add theatre error:', error);
      }
    });
  }

  onEdit(theatre: Theatre): void {
    this.editingTheatre = { ...theatre };
    this.theatreData = { ...theatre };
  }

  onDelete(theatre: Theatre): void {
    if (confirm(`Are you sure you want to delete the theatre: ${theatre.name}?`)) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.theatreService.deleteTheatre(theatre.theatreId!).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.loadTheatres();
         
            this.successMessage = 'Theatre deleted successfully!';
      
            
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to delete theatre. Please try again.';
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.theatreData.name.trim()) {
      this.errorMessage = 'Theatre name is required';
      return false;
    }

    if (!this.theatreData.address.trim()) {
      this.errorMessage = 'Theatre address is required';
      return false;
    }

    if (!this.theatreData.cityId || this.theatreData.cityId === 0) {
      this.errorMessage = 'Please select a city';
      return false;
    }

    return true;
  }

  resetForm(): void {
    this.theatreData = {
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