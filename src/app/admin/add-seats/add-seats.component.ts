import { Component, OnInit } from '@angular/core';
import { MovieService, Theatre } from '../../services/movie.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeatService, Seat } from '../../services/seat.service';
import { AlertService } from '../../shared/alert.service';

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

  constructor(private movieService: MovieService, private fb: FormBuilder, private seatService: SeatService, private alertService: AlertService) {
    this.addSeatForm = this.fb.group({
      theatreId: ['', Validators.required],
      seatNumber: ['', Validators.required],
      seatType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.movieService.getTheatres('Mumbai').subscribe({
      next: (theatres) => {
        this.theatres = theatres;
      },
      error: () => {
        this.alertService.showAlert('Failed to load theatres.');
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
        this.alertService.showAlert('Failed to fetch seats.');
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
          this.alertService.showAlert('Seat updated successfully!');
          this.addSeatForm.reset();
          this.isSubmitting = false;
          this.editingSeat = null;
          this.loadAllSeats();
        },
        error: (error) => {
          if (error.status === 200 && error.statusText === 'OK') {
            this.alertService.showAlert('Seat updated successfully!');
            this.addSeatForm.reset();
            this.isSubmitting = false;
            this.editingSeat = null;
            this.loadAllSeats();
          } else if (typeof error.error === 'string' && error.error.includes('Seat updated')) {
            this.alertService.showAlert('Seat updated successfully!');
            this.addSeatForm.reset();
            this.isSubmitting = false;
            this.editingSeat = null;
            this.loadAllSeats();
          } else {
            this.alertService.showAlert('Failed to update seat.');
            this.isSubmitting = false;
          }
        }
      });
    } else {
      this.movieService.addSeat(this.addSeatForm.value).subscribe({
        next: () => {
          this.alertService.showAlert('Seat added successfully!');
          this.addSeatForm.reset();
          this.isSubmitting = false;
          this.loadAllSeats();
        },
        error: (error) => {
          if (error.status === 200 && error.statusText === 'OK') {
            this.alertService.showAlert('Seat added successfully!');
            this.addSeatForm.reset();
            this.loadAllSeats();
          } else if (typeof error.error === 'string' && error.error.includes('Seat created')) {
            this.alertService.showAlert('Seat added successfully!');
            this.addSeatForm.reset();
            this.loadAllSeats();
          } else {
            this.alertService.showAlert('Failed to add seat.');
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
          this.alertService.showAlert('Seat deleted successfully!');
          this.loadAllSeats();
        },
        error: () => {
          this.alertService.showAlert('Failed to delete seat.');
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingSeat = null;
    this.addSeatForm.reset();
  }
}
