import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Movie, MovieService } from 'src/app/services/movie.service';
import { AlertService } from '../../shared/alert.service';

@Component({
  selector: 'app-movie-management',
  templateUrl: './movie-management.component.html',
  styleUrls: ['./movie-management.component.css']
})
export class MovieManagementComponent implements OnInit {
  movies: Movie[] = [];
  movieForm: FormGroup;
  isFormVisible = false;
  editMode = false;
  isLoading = false;
  selectedmovieId: number | null = null;

  constructor(
    private movieService: MovieService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      durationMins: [0, Validators.required],
      genre: ['', Validators.required],
      language: ['', Validators.required],
      releaseDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getMovies().subscribe(movies => {
      this.movies = movies;
      console.log(movies)
    });
  }

  showMovieForm(): void {
    this.editMode = false;
    this.movieForm.reset();
    this.isFormVisible = true;
  }

  hideMovieForm(): void {
    this.isFormVisible = false;
    this.selectedmovieId = null;
  }

  editMovie(movie: Movie): void {
    this.editMode = true;
    this.selectedmovieId = movie.movieId;
    this.isFormVisible = true;
    this.movieForm.patchValue({
      title: movie.title,
      description: movie.description,
      durationMins: movie.durationMins,
      genre: movie.genre,
      language: movie.language,
      releaseDate: movie.releaseDate,
      posterFile: null // File input cannot be prefilled
    });
  }

  deleteMovie(id: number): void {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(id).subscribe({
        next: () => {
          this.alertService.showAlert('Movie deleted successfully!');
          this.loadMovies();
        },
        error: () => {
          this.alertService.showAlert('Failed to delete movie.');
        }
      });
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.movieForm.patchValue({ posterFile: file });
    }
  }

  onFormSubmit(): void {
    if (this.movieForm.invalid) {
      this.alertService.showAlert('Please fill all required fields.');
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    Object.entries(this.movieForm.value).forEach(([key, value]) => {
      if (key === 'posterFile' && value instanceof File) {
        formData.append(key, value);
      } else if (key !== 'posterFile' && value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    // Set createdByUserId from localStorage
    const currentUser = localStorage.getItem('currentUser');
    const userId = currentUser ? JSON.parse(currentUser).userId : null;
    formData.append('createdByUserId', userId);
    if (this.editMode && this.selectedmovieId) {
      this.movieService.updateMovie(this.selectedmovieId, formData).subscribe({
        next: () => {
          this.alertService.showAlert('Movie updated successfully!');
          this.finalizeFormSubmission();
        },
        error: (error) => {
          console.log(error)
          this.alertService.showAlert('Failed to update movie.');
          this.isLoading = false;
        }
      });
    } else {
      this.movieService.createMovie(formData).subscribe({
        next: () => {
          this.alertService.showAlert('Movie added successfully!');
          this.finalizeFormSubmission();
        },
        error: () => {
          this.alertService.showAlert('Failed to add movie.');
          this.isLoading = false;
        }
      });
    }
  }

  finalizeFormSubmission(): void {
    this.isLoading = false;
    this.hideMovieForm();
    this.loadMovies();
  }
}
