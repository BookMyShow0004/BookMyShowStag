import { Component, OnInit } from '@angular/core';
import { MovieService, Theatre } from '../../services/movie.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeatService, Seat } from '../../services/seat.service';

@Component({
  selector: 'app-add-seats',
  templateUrl: './add-seats.component.html',
  styleUrls: ['./add-seats.component.css']
})
export class AddSeatsComponent implements OnInit {
  addSeatForm: FormGroup;
  theatres: Theatre[] = [];
  isSubmitting = false;
  allSeats: Seat[] = [];
  editingSeat: Seat | null = null;

  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  constructor(
    private movieService: MovieService,
    private fb: FormBuilder,
    private seatService: SeatService
  ) {
    this.addSeatForm = this.fb.group({
      theatreId: ['', Validators.required],
      seatNumber: ['', Validators.required],
      seatType: ['', Validators.required]
    });
  }

  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  ngOnInit(): void {
    this.movieService.getTheatres('Mumbai').subscribe({
      next: (theatres) => {
        this.theatres = theatres;
      },
      error: () => {
        this.showToastMessage('Failed to load theatres.', 'error');
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
        this.showToastMessage('Failed to fetch seats.', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.addSeatForm.invalid) return;
    this.isSubmitting = true;
    if (this.editingSeat) {
      const updatedSeat = { ...this.editingSeat, ...this.addSeatForm.value };
      this.seatService.updateSeat(updatedSeat).subscribe({
        next: () => {
          this.showToastMessage('Seat updated successfully!', 'success');
          this.addSeatForm.reset();
          this.isSubmitting = false;
          this.editingSeat = null;
          this.loadAllSeats();
        },
        error: (error) => {
          if (error.status === 200 && error.statusText === 'OK') {
            this.showToastMessage('Seat updated successfully!', 'success');
            this.addSeatForm.reset();
            this.isSubmitting = false;
            this.editingSeat = null;
            this.loadAllSeats();
          } else if (typeof error.error === 'string' && error.error.includes('Seat updated')) {
            this.showToastMessage('Seat updated successfully!', 'success');
            this.addSeatForm.reset();
            this.isSubmitting = false;
            this.editingSeat = null;
            this.loadAllSeats();
          } else {
            this.showToastMessage('Failed to update seat.', 'error');
            this.isSubmitting = false;
          }
        }
      });
    } else {
      this.movieService.addSeat(this.addSeatForm.value).subscribe({
        next: () => {
          this.showToastMessage('Seat added successfully!', 'success');
          this.addSeatForm.reset();
          this.isSubmitting = false;
          this.loadAllSeats();
        },
        error: (error) => {
          if (error.status === 200 && error.statusText === 'OK') {
            this.showToastMessage('Seat added successfully!', 'success');
            this.addSeatForm.reset();
            this.loadAllSeats();
          } else if (typeof error.error === 'string' && error.error.includes('Seat created')) {
            this.showToastMessage('Seat added successfully!', 'success');
            this.addSeatForm.reset();
            this.loadAllSeats();
          } else {
            this.showToastMessage('Failed to add seat.', 'error');
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
          this.showToastMessage('Seat deleted successfully!', 'success');
          this.loadAllSeats();
        },
        error: () => {
          this.showToastMessage('Failed to delete seat.', 'error');
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingSeat = null;
    this.addSeatForm.reset();
  }
}
