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
  currentPoster: string = '';

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
      posterFile: [null] // Remove Validators.required for edit flexibility
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
    // Explicitly clear file input
    this.clearFileInput();
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
      releaseDate: movie.releaseDate
      // Do NOT patch posterFile
    });
    this.clearFileInput();
    // Store the current posterBase64 or poster URL for fallback
    this.currentPoster = movie.posterBase64 || '';
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
      // Validate file type (JPEG/PNG) and size (max 2MB)
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (!validTypes.includes(file.type)) {
        this.alertService.showAlert('Only JPEG and PNG images are allowed.');
        this.clearFileInput();
        return;
      }
      if (file.size > maxSize) {
        this.alertService.showAlert('Image size must be less than 2MB.');
        this.clearFileInput();
        return;
      }
      this.movieForm.patchValue({ posterFile: file });
      this.movieForm.get('posterFile')?.markAsDirty();
    }
  }

  onFormSubmit(): void {
    // For edit: allow posterFile to be empty, but for add: require it
    if (
      this.movieForm.invalid ||
      (!this.editMode && !this.movieForm.value.posterFile)
    ) {
      this.alertService.showAlert('Please fill all required fields.');
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    Object.entries(this.movieForm.value).forEach(([key, value]) => {
      if (key === 'posterFile' && value instanceof File) {
        formData.append('PosterFile', value); // Use correct field name for API
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
    this.movieForm.reset();
    this.clearFileInput();
    this.hideMovieForm();
    this.loadMovies();
  }

  clearFileInput(): void {
    // Clear the file input manually (if you use a template ref, e.g. #fileInput)
    const fileInput = document.getElementById('posterFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
