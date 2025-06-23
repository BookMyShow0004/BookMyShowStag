import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService, Movie, MovieReview, MovieComment, RatingRequest, CommentRequest } from '../services/movie.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit {
  movie: Movie | undefined;
  reviews: MovieReview[] = [];
  comments: MovieComment[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  currentUser: any = null;

  // Rating and Review
  userRating: number = 0;
  userReview: string = '';
  isSubmittingRating: boolean = false;

  // Comment
  newComment: string = '';
  isSubmittingComment: boolean = false;

  // UI States
  activeTab: 'overview' | 'reviews' | 'comments' = 'overview';
  showRatingForm: boolean = false;
  showCommentForm: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMovieDetails();
  }

  loadMovieDetails(): void {
    const movieId = Number(this.route.snapshot.paramMap.get('id'));

    this.movieService.getMovieById(movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        if (movie) {
          this.loadReviews(movieId);
          this.loadComments(movieId);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load movie details';
        this.isLoading = false;
        console.error('Error loading movie:', error);
      }
    });
  }

  loadReviews(movieId: number): void {
    this.movieService.getMovieReviews(movieId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  loadComments(movieId: number): void {
    this.movieService.getMovieComments(movieId).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
      }
    });
  }

  setActiveTab(tab: 'overview' | 'reviews' | 'comments'): void {
    this.activeTab = tab;
  }

  onRatingChange(rating: number): void {
    this.userRating = rating;
  }

  submitRating(): void {
    if (!this.movie || !this.currentUser) {
      this.errorMessage = 'Please login to rate this movie';
      return;
    }

    if (this.userRating === 0) {
      this.errorMessage = 'Please select a rating';
      return;
    }

    this.isSubmittingRating = true;
    this.errorMessage = '';

    const ratingRequest: RatingRequest = {
      movieId: this.movie.movieId,
      rating: this.userRating,
      review: this.userReview
    };

    this.movieService.addRating(ratingRequest).subscribe({
      next: (response) => {
        this.isSubmittingRating = false;
        if (response.success) {
          this.showRatingForm = false;
          this.userRating = 0;
          this.userReview = '';
          this.loadReviews(this.movie!.movieId);
          this.loadMovieDetails(); // Refresh movie data to update average rating
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isSubmittingRating = false;
        this.errorMessage = 'Failed to submit rating';
        console.error('Error submitting rating:', error);
      }
    });
  }

  submitComment(): void {
    if (!this.movie || !this.currentUser) {
      this.errorMessage = 'Please login to comment on this movie';
      return;
    }

    if (!this.newComment.trim()) {
      this.errorMessage = 'Please enter a comment';
      return;
    }

    this.isSubmittingComment = true;
    this.errorMessage = '';

    const commentRequest: CommentRequest = {
      movieId: this.movie.movieId,
      comment: this.newComment.trim()
    };

    this.movieService.addComment(commentRequest).subscribe({
      next: (response) => {
        this.isSubmittingComment = false;
        if (response.success) {
          this.showCommentForm = false;
          this.newComment = '';
          this.loadComments(this.movie!.movieId);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isSubmittingComment = false;
        this.errorMessage = 'Failed to submit comment';
        console.error('Error submitting comment:', error);
      }
    });
  }

  likeReview(reviewId: number): void {
    if (!this.currentUser) {
      this.errorMessage = 'Please login to like reviews';
      return;
    }

    this.movieService.likeReview(reviewId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadReviews(this.movie!.movieId);
        }
      },
      error: (error) => {
        console.error('Error liking review:', error);
      }
    });
  }

  likeComment(commentId: number): void {
    if (!this.currentUser) {
      this.errorMessage = 'Please login to like comments';
      return;
    }

    this.movieService.likeComment(commentId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadComments(this.movie!.movieId);
        }
      },
      error: (error) => {
        console.error('Error liking comment:', error);
      }
    });
  }

  bookMovie(): void {
    if (!this.currentUser) {
      this.errorMessage = 'Please login to book tickets';
      return;
    }

    if (this.movie) {
      this.router.navigate(['/book-tickets'], {
        queryParams: { movieId: this.movie.movieId }
      });
    }
  }

  getStarRating(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < rating ? 1 : 0);
  }

  getAverageRating(): number {
    if (!this.movie) return 0;
    return Math.round(this.movie.averageRating * 10) / 10;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  toggleRatingForm(): void {
    if (!this.currentUser) {
      this.errorMessage = 'Please login to rate this movie';
      return;
    }
    this.showRatingForm = !this.showRatingForm;
    this.errorMessage = '';
  }

  toggleCommentForm(): void {
    if (!this.currentUser) {
      this.errorMessage = 'Please login to comment on this movie';
      return;
    }
    this.showCommentForm = !this.showCommentForm;
    this.errorMessage = '';
  }

  getGenreColor(genre: string): string {
    const colors: { [key: string]: string } = {
      'Action': '#ff6b6b',
      'Comedy': '#4ecdc4',
      'Drama': '#45b7d1',
      'Horror': '#96ceb4',
      'Romance': '#feca57',
      'Thriller': '#ff9ff3',
      'Sci-Fi': '#54a0ff'
    };
    return colors[genre] || '#667eea';
  }
}
