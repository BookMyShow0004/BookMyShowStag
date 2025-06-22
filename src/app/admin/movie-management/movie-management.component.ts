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
  selectedMovieId: number | null = null;

  constructor(
    private movieService: MovieService,
    private fb: FormBuilder
  ) {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      genre: ['', Validators.required],
      language: ['', Validators.required],
      duration: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      image: ['', Validators.required],
      description: ['', Validators.required],
      isSuggested: [false]
    });
  }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getMovies().subscribe(movies => {
      this.movies = movies;
    });
  }

  showMovieForm(): void {
    this.editMode = false;
    this.movieForm.reset({ isSuggested: false });
    this.isFormVisible = true;
  }

  hideMovieForm(): void {
    this.isFormVisible = false;
    this.selectedMovieId = null;
  }

  editMovie(movie: Movie): void {
    this.editMode = true;
    this.selectedMovieId = movie.id;
    // Omit fields that are not in the form
    const { theaters, averageRating, totalRatings, totalReviews, totalLikes, totalComments, releaseDate, ...formValues } = movie;
    this.movieForm.setValue(formValues);
    this.isFormVisible = true;
  }

  deleteMovie(id: number): void {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(id).subscribe(() => {
        this.loadMovies();
      });
    }
  }

  onFormSubmit(): void {
    if (this.movieForm.invalid) {
      return;
    }

    this.isLoading = true;
    const movieData = this.movieForm.value;

    if (this.editMode) {
      // Re-add properties not in the form but required by the Movie interface
      const fullMovieData: Movie = {
        ...movieData,
        id: this.selectedMovieId!,
        releaseDate: new Date().toISOString(), // Placeholder, consider adding to form
        theaters: [], // Placeholder
        averageRating: 0,
        totalRatings: 0,
        totalReviews: 0,
        totalLikes: 0,
        totalComments: 0,
      };
      this.movieService.updateMovie(fullMovieData).subscribe(() => {
        this.finalizeFormSubmission();
      });
    } else {
      // In a real app, you might have default values for these
      const newMovieData = {
        ...movieData,
        releaseDate: new Date().toISOString(),
        theaters: [],
        averageRating: movieData.rating,
        totalRatings: 1,
        totalReviews: 0,
        totalLikes: 0,
        totalComments: 0,
      };
      this.movieService.addMovie(newMovieData).subscribe(() => {
        this.finalizeFormSubmission();
      });
    }
  }

  finalizeFormSubmission(): void {
    this.isLoading = false;
    this.hideMovieForm();
    this.loadMovies();
  }
}
