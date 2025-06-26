import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService, Movie, MovieReview, MovieComment } from '../services/movie.service';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../shared/alert.service';

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

  // Like Movie
  userHasLiked: boolean = false;
  isSubmittingLike: boolean = false;
  totalLikes: number = 0;

  // Check if the user has already commented
  hasAlreadyCommented: boolean = false;

  // Review Modal State
  showReviewModal: boolean = false;
  reviewRating: number = 0;
  reviewComment: string = '';
  reviewSubmitting: boolean = false;
  reviewError: string = '';
  reviewSuccess: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private authService: AuthService,
    private alertService: AlertService
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
        // Fetch total likes from API
        this.movieService.getTotalLikes(movieId).subscribe(count => {
          this.totalLikes = count;
        });
        // Check if user has already liked
        this.userHasLiked = false; // Default to false, since getUserLikeForMovie is removed
        if (movie) {
          this.loadReviews(movieId);
          this.loadComments(movieId);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load movie details.';
        this.isLoading = false;
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
        // Set hasAlreadyCommented based on current user userId (not userName)
        if (this.currentUser) {
          this.hasAlreadyCommented = this.comments.some(
            c => c.userId === this.currentUser.userId
          );
        } else {
          this.hasAlreadyCommented = false;
        }
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.hasAlreadyCommented = false;
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
      this.alertService.showAlert('Please login to comment on this movie');
      return;
    }

    if (!this.newComment.trim()) {
      this.alertService.showAlert('Please enter a comment');
      return;
    }

    // Check if the current user has already commented on this movie
    const alreadyCommented = this.comments.some(
      c => c.userId === this.currentUser.userId
    );
    if (alreadyCommented) {
      this.alertService.showAlert('You have already commented on this movie.');
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
        if (response?.success === false) {
          this.alertService.showAlert(response.message || 'Failed to add comment');
        } else {
          this.showCommentForm = false;
          this.newComment = '';
          this.loadComments(this.movie!.movieId);
        }
      },
      error: (error: any) => {
        this.isSubmittingComment = false;
        this.alertService.showAlert('Failed to add comment');
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

  likeMovie(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.movie || this.userHasLiked || !this.currentUser) return;
    this.isSubmittingLike = true;
    this.movieService.addLike(this.movie.movieId, this.currentUser.userId).subscribe({
      next: (response: any) => {
        this.userHasLiked = true;
        this.isSubmittingLike = false;
        this.movieService.getTotalLikes(this.movie!.movieId).subscribe(count => {
          this.totalLikes = count;
        });
        this.alertService.showAlert('You liked this movie!');
      },
      error: (error: any) => {
        console.log(error);
        this.alertService.showAlert(error.error);
        this.isSubmittingLike = false;
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

  goBack(): void {
    window.history.back();
  }

  goToTheatres(): void {
    const movieId = Number(this.route.snapshot.paramMap.get('id'));
    this.router.navigate(['/theatres', movieId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  openReviewModal(): void {
    this.reviewRating = 0;
    this.reviewComment = '';
    this.reviewError = '';
    this.reviewSuccess = '';
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  setReviewRating(rating: number): void {
    this.reviewRating = rating;
  }

  canSubmitReview(): boolean {
    if (!this.currentUser || !this.movie) return false;
    // Prevent multiple reviews by the same user for the same movie
    return !this.reviews.some(r => r.userId === this.currentUser.userId);
  }

  submitReview(): void {
    if (!this.currentUser || !this.movie) {
      this.reviewError = 'Please login to submit a review.';
      return;
    }
    if (!this.reviewRating) {
      this.reviewError = 'Please select a rating.';
      return;
    }
    this.reviewSubmitting = true;
    this.reviewError = '';
    const review = {
      movieId: this.movie.movieId,
      userId: this.currentUser.userId,
      rating: this.reviewRating,
      comment: this.reviewComment
    };
    this.movieService.addReview(review).subscribe({
      next: () => {
        this.reviewSuccess = 'Review submitted successfully!';
        this.reviewSubmitting = false;
        this.showReviewModal = false;
        this.loadReviews(this.movie!.movieId);
      },
      error: () => {
        this.reviewError = 'Failed to submit review.';
        this.reviewSubmitting = false;
      }
    });
  }
}
