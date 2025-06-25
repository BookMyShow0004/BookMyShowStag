import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService, Movie, MovieReview, MovieComment } from '../services/movie.service';
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
  currentUser1: any = null;
  // Average Rating
  averageRatingRounded: number = 0;

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
        // Remove old averageRatingRounded logic, let reviews API control it
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
        // Filter reviews to only those matching the current movieId (defensive, in case API returns more)
        const filteredReviews = reviews.filter(r => r.movieId === movieId);
        this.reviews = filteredReviews;
        if (filteredReviews.length > 0) {
          // Calculate average rating for this movie only
          const sum = filteredReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          this.averageRatingRounded = Math.round(sum / filteredReviews.length);
        } else {
          this.averageRatingRounded = 0;
        }
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

    const ratingRequest = {
      movieId: this.movie.movieId,
      rating: this.userRating,
      review: this.userReview
    };

    this.movieService.addRating(ratingRequest).subscribe({
      next: (response: any) => {
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
      error: (error: any) => {
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
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const commentRequest = {
      userId: currentUser.userId,
      movieId: this.movie.movieId,
      content: this.newComment.trim()
    };

    this.movieService.addComment(commentRequest).subscribe({
      next: (response: any) => {
        this.isSubmittingComment = false;
        // Accept both { success: true } or just a successful response
        if (response?.success === false) {
          this.errorMessage = response.message || 'Failed to add comment';
        } else {
          this.showCommentForm = false;
          this.newComment = '';
          this.loadComments(this.movie!.movieId);
        }
      },
      error: (error: any) => {
        this.isSubmittingComment = false;
        this.errorMessage = 'Failed to add comment';
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
      next: (response: any) => {
        if (response.success) {
          this.loadReviews(this.movie!.movieId);
        }
      },
      error: (error: any) => {
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
      next: (response: any) => {
        if (response.success) {
          this.loadComments(this.movie!.movieId);
        }
      },
      error: (error: any) => {
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

  goToTheatres(): void {
    // Get the current movieId from the route params
    const movieId = Number(this.route.snapshot.paramMap.get('id'));
    // Navigate to the theatres page with the movieId as a route param
    this.router.navigate(['/theatres', movieId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
