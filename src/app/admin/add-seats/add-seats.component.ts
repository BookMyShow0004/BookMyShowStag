import { Component, OnInit } from '@angular/core';
import { MovieService, Theater } from '../../services/movie.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeatService, Seat } from '../../services/seat.service';

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
  allSeats: Seat[] = [];
  editingSeat: Seat | null = null;

  constructor(private movieService: MovieService, private fb: FormBuilder, private seatService: SeatService) {
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
    this.loadAllSeats();
  }

  loadAllSeats(): void {
    this.seatService.getAllSeats().subscribe({
      next: (seats: Seat[]) => {
        this.allSeats = seats;
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch seats.';
      }
    });
  }

  onSubmit(): void {
    if (this.addSeatForm.invalid) return;
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.editingSeat) {
      // Update seat logic (assuming updateSeat exists in SeatService)
      const updatedSeat = { ...this.editingSeat, ...this.addSeatForm.value };
      this.seatService.updateSeat(updatedSeat).subscribe({
        next: () => {
          this.successMessage = 'Seat updated successfully!';
          this.addSeatForm.reset();
          this.isSubmitting = false;
          this.editingSeat = null;
          this.loadAllSeats();
        },
        error: (error) => {
          // Handle non-JSON 200 OK with text response
          if (error.status === 200 && error.statusText === 'OK') {
            this.successMessage = 'Seat updated successfully!';
            this.addSeatForm.reset();
            this.isSubmitting = false;
            this.editingSeat = null;
            this.loadAllSeats();
          } else if (typeof error.error === 'string' && error.error.includes('Seat updated')) {
            this.successMessage = 'Seat updated successfully!';
            this.addSeatForm.reset();
            this.isSubmitting = false;
            this.editingSeat = null;
            this.loadAllSeats();
          } else {
            console.log('Error updating seat', error);
            this.errorMessage = 'Failed to update seat.';
            this.isSubmitting = false;
          }
        }
      });
    } else {
      this.movieService.addSeat(this.addSeatForm.value).subscribe({
        next: () => {
          this.successMessage = 'Seat added successfully!';
          this.addSeatForm.reset();
          this.isSubmitting = false;
          this.loadAllSeats();
        },
        error: (error) => {
          // Handle non-JSON 200 OK with text response
          console.log(error)
          if (error.status === 200 && error.statusText === 'OK') {
            this.successMessage = 'Seat added successfully!';
            this.addSeatForm.reset();
            this.loadAllSeats();
          } else if (typeof error.error === 'string' && error.error.includes('Seat created')) {
            this.successMessage = 'Seat added successfully!';
            this.addSeatForm.reset();
            this.loadAllSeats();
          } else {
            console.log(error)
            this.errorMessage = 'Failed to add seat.';
          }
          this.isSubmitting = false;
        }
      });
    }
  }

  editSeat(seat: Seat): void {
    this.editingSeat = seat;
    this.addSeatForm.patchValue({
      theatreId: seat.theatreId,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType
    });
  }

  deleteSeat(seat: Seat): void {
    if (confirm('Are you sure you want to delete seat ' + seat.seatNumber + '?')) {
      this.seatService.deleteSeat(seat.seatId).subscribe({
        next: () => {
          this.successMessage = 'Seat deleted successfully!';
          this.loadAllSeats();
        },
        error: () => {
          this.errorMessage = 'Failed to delete seat.';
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingSeat = null;
    this.addSeatForm.reset();
  }
}
