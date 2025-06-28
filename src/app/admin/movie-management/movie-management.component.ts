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
  selectedPosterFile: File | null = null;
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
      releaseDate: ['', Validators.required]
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
    });
    this.selectedPosterFile = null;
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
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSize = 2 * 1024 * 1024; 
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
      this.selectedPosterFile = file;
    }
  }

  async onFormSubmit(): Promise<void> {
    
    if (
      this.movieForm.invalid ||
      (!this.editMode && !this.selectedPosterFile)
    ) {
      this.alertService.showAlert('Please fill all required fields.' + (!this.editMode ? ' and select an image.' : ''));
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    for (const [key, value] of Object.entries(this.movieForm.value)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    }
    if (this.selectedPosterFile) {
      formData.append('PosterFile', this.selectedPosterFile);
      console.log('Appending file:', this.selectedPosterFile);
    }
    const currentUser = localStorage.getItem('currentUser');
    const userId = currentUser ? JSON.parse(currentUser).userId : null;
    formData.append('createdByUserId', userId);
    for (const pair of (formData as any).entries()) {
      console.log('FormData:', pair[0], pair[1]);
    }
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

  base64ToBlob(base64: string, mime: string): Blob {
    const base64Data = base64.split(',')[1] || base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  finalizeFormSubmission(): void {
    this.isLoading = false;
    this.movieForm.reset();
    this.clearFileInput();
    this.hideMovieForm();
    this.loadMovies();
  }

  clearFileInput(): void {
    const fileInput = document.getElementById('posterFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
