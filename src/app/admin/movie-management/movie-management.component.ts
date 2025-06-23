import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Movie, MovieService } from 'src/app/services/movie.service';

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
    private fb: FormBuilder
  ) {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      durationMins: [0, Validators.required],
      genre: ['', Validators.required],
      language: ['', Validators.required],
      releaseDate: ['', Validators.required],
      createdByUserId: [0, Validators.required],
      posterFile: [null, Validators.required]
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
    // Prefill form with movie data if needed
  }

  deleteMovie(id: number): void {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(id).subscribe(() => {
        this.loadMovies();
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
    this.movieService.createMovie(formData).subscribe(response => {
      this.finalizeFormSubmission();
    });
  }

  finalizeFormSubmission(): void {
    this.isLoading = false;
    this.hideMovieForm();
    this.loadMovies();
  }
}
