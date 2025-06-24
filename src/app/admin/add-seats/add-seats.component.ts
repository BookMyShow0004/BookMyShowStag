import { Component, OnInit } from '@angular/core';
import { MovieService, Theater } from '../../services/movie.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-seats',
  templateUrl: './add-seats.component.html',
  styleUrls: ['./add-seats.component.css']
})
export class AddSeatsComponent implements OnInit {
  addSeatForm: FormGroup;
  theaters: Theater[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private movieService: MovieService, private fb: FormBuilder) {
    this.addSeatForm = this.fb.group({
      theatreId: ['', Validators.required],
      seatNumber: ['', Validators.required],
      seatType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.movieService.getTheaters('Mumbai').subscribe({
      next: (theaters) => {
        this.theaters = theaters;
      },
      error: () => {
        this.errorMessage = 'Failed to load theaters.';
      }
    });
  }

  onSubmit(): void {
    if (this.addSeatForm.invalid) return;
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.movieService.addSeat(this.addSeatForm.value).subscribe({
      next: () => {
        this.successMessage = 'Seat added successfully!';
        this.addSeatForm.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        // Handle non-JSON 200 OK with text response
        if (error.status === 200 && error.statusText === 'OK') {
          this.successMessage = 'Seat added successfully!';
          this.addSeatForm.reset();
        } else if (typeof error.error === 'string' && error.error.includes('Seat created')) {
          this.successMessage = 'Seat added successfully!';
          this.addSeatForm.reset();
        } else {
          this.errorMessage = 'Failed to add seat.';
        }
        this.isSubmitting = false;
      }
    });
  }
}
