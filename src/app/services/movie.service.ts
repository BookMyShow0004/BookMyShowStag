import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Movie {
  id: number;
  title: string;
  genre: string;
  language: string;
  duration: string;
  rating: number;
  image: string;
  releaseDate: string;
  description: string;
  price: number;
  theaters: Theater[];
  averageRating: number;
  totalRatings: number;
  totalReviews: number;
  totalLikes: number;
  totalComments: number;
  isSuggested?: boolean;
}

export interface Theater {
  id: number;
  name: string;
  location: string;
  showTimes: string[];
  amenities: string[];
  rating: number;
}

export interface MovieReview {
  id: number;
  movieId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  review: string;
  likes: number;
  createdAt: Date;
  isLiked?: boolean;
}

export interface MovieComment {
  id: number;
  movieId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  comment: string;
  likes: number;
  createdAt: Date;
  isLiked?: boolean;
}

export interface Booking {
  id: number;
  movieId: number;
  movieTitle: string;
  theaterId: number;
  theaterName: string;
  showTime: string;
  bookingDate: string;
  selectedSeats: string[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookingCode: string;
  createdAt: Date;
  userId: number;
  qrCodeUrl: string;
}

export interface RatingRequest {
  movieId: number;
  rating: number;
  review?: string;
}

export interface CommentRequest {
  movieId: number;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private movies: Movie[] = [
    {
      id: 1,
      title: 'Avengers: Endgame',
      genre: 'Action',
      language: 'English',
      duration: '3h 1m',
      rating: 8.4,
      image: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      releaseDate: '2023-04-26',
      description: 'The grave course of events set in motion by Thanos that wiped out half the universe...',
      price: 200,
      averageRating: 4.2,
      totalRatings: 1250,
      totalReviews: 89,
      totalLikes: 456,
      totalComments: 67,
      theaters: [
        { 
          id: 1, 
          name: 'PVR Cinemas', 
          location: 'Phoenix Mall', 
          showTimes: ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM'],
          amenities: ['Dolby Atmos', 'Recliner Seats', 'Food Service'],
          rating: 4.5
        },
        { 
          id: 2, 
          name: 'INOX', 
          location: 'R-City Mall', 
          showTimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'],
          amenities: ['Dolby Digital', 'Premium Seats'],
          rating: 4.3
        }
      ]
    },
    {
      id: 2,
      title: 'RRR',
      genre: 'Action',
      language: 'Hindi',
      duration: '3h 7m',
      rating: 7.9,
      image: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      releaseDate: '2023-03-25',
      description: 'A fictional story about two legendary revolutionaries...',
      price: 180,
      averageRating: 4.0,
      totalRatings: 890,
      totalReviews: 45,
      totalLikes: 234,
      totalComments: 34,
      isSuggested: true,
      theaters: [
        { 
          id: 3, 
          name: 'Cinepolis', 
          location: 'Viviana Mall', 
          showTimes: ['12:00 PM', '4:00 PM', '8:00 PM'],
          amenities: ['Dolby Atmos', 'Recliner Seats'],
          rating: 4.2
        }
      ]
    },
    {
      id: 3,
      title: 'Dune: Part Two',
      genre: 'Sci-Fi',
      language: 'English',
      duration: '2h 46m',
      rating: 8.9,
      image: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      releaseDate: '2024-03-01',
      description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge...',
      price: 250,
      averageRating: 4.5,
      totalRatings: 1500,
      totalReviews: 120,
      totalLikes: 600,
      totalComments: 90,
      isSuggested: true,
      theaters: [
        { id: 4, name: 'IMAX Wadala', location: 'Wadala', showTimes: ['10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM'], amenities: ['IMAX Laser', 'Recliner Seats'], rating: 4.8 }
      ]
    },
    {
      id: 4,
      title: 'Joker',
      genre: 'Drama',
      language: 'English',
      duration: '2h 2m',
      rating: 8.4,
      image: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      releaseDate: '2019-10-02',
      description: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society.',
      price: 190,
      averageRating: 4.2,
      totalRatings: 1100,
      totalReviews: 95,
      totalLikes: 550,
      totalComments: 80,
      theaters: [
        { id: 5, name: 'Movietime Cinema', location: 'Thane', showTimes: ['11:30 AM', '3:00 PM', '7:00 PM'], amenities: ['4K Projection'], rating: 4.1 }
      ]
    },
    {
      id: 5,
      title: 'Oppenheimer',
      genre: 'Biography',
      language: 'English',
      duration: '3h 0m',
      rating: 8.6,
      image: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      releaseDate: '2023-07-21',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
      price: 280,
      averageRating: 4.3,
      totalRatings: 1800,
      totalReviews: 150,
      totalLikes: 700,
      totalComments: 110,
      isSuggested: true,
      theaters: [
        { id: 6, name: 'PVR ICON', location: 'Andheri', showTimes: ['10:30 AM', '2:30 PM', '6:30 PM', '10:30 PM'], amenities: ['IMAX', 'Gold Class'], rating: 4.7 }
      ]
    },
    {
      id: 6,
      title: '3 Idiots',
      genre: 'Comedy',
      language: 'Hindi',
      duration: '2h 50m',
      rating: 8.4,
        image: 'https://image.tmdb.org/t/p/w500/6kEEpnaT21a23e10hGfrt6Mv23v.jpg',
        releaseDate: '2009-12-25',
      description: 'Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently.',
      price: 150,
      averageRating: 4.8,
      totalRatings: 2500,
      totalReviews: 200,
      totalLikes: 1200,
      totalComments: 180,
      theaters: [
        { id: 7, name: 'G7 Multiplex (Gaiety Galaxy)', location: 'Bandra', showTimes: ['12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'], amenities: ['Single Screen'], rating: 4.0 }
      ]
    }
  ];

  private reviews: MovieReview[] = [
    {
      id: 1,
      movieId: 1,
      userId: 1,
      userName: 'John Doe',
      rating: 5,
      review: 'Amazing movie! The action sequences were incredible and the story was well-paced.',
      likes: 12,
      createdAt: new Date('2023-05-01')
    },
    {
      id: 2,
      movieId: 1,
      userId: 2,
      userName: 'Jane Smith',
      rating: 4,
      review: 'Great entertainment value. The visual effects were stunning.',
      likes: 8,
      createdAt: new Date('2023-05-02')
    }
  ];

  private comments: MovieComment[] = [
    {
      id: 1,
      movieId: 1,
      userId: 1,
      userName: 'John Doe',
      comment: 'Can\'t wait to watch this again!',
      likes: 5,
      createdAt: new Date('2023-05-01')
    },
    {
      id: 2,
      movieId: 1,
      userId: 2,
      userName: 'Jane Smith',
      comment: 'The best Marvel movie ever!',
      likes: 3,
      createdAt: new Date('2023-05-02')
    }
  ];

  private bookings: Booking[] = [
    {
      id: 1,
      movieId: 1,
      movieTitle: 'Avengers: Endgame',
      theaterId: 1,
      theaterName: 'PVR Cinemas',
      showTime: '5:00 PM',
      bookingDate: '2023-05-15',
      selectedSeats: ['A5', 'A6'],
      totalAmount: 400,
      status: 'confirmed',
      bookingCode: 'BMS001',
      createdAt: new Date('2023-05-10'),
      userId: 1,
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BMS001'
    }
  ];

  constructor() { }

  getMovies(): Observable<Movie[]> {
    return of(this.movies).pipe(delay(500));
  }

  getMovieById(id: number): Observable<Movie | undefined> {
    const movie = this.movies.find(m => m.id === id);
    return of(movie).pipe(delay(300));
  }

  searchMovies(query: string): Observable<Movie[]> {
    const filtered = this.movies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.description.toLowerCase().includes(query.toLowerCase()) ||
      movie.genre.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }

  filterMovies(filters: { genre?: string; language?: string; rating?: number }): Observable<Movie[]> {
    let filtered = this.movies;

    if (filters.genre) {
      filtered = filtered.filter(movie => movie.genre === filters.genre);
    }

    if (filters.language) {
      filtered = filtered.filter(movie => movie.language === filters.language);
    }

    if (filters.rating) {
      filtered = filtered.filter(movie => movie.averageRating >= filters.rating!);
    }

    return of(filtered).pipe(delay(300));
  }

  getMovieReviews(movieId: number): Observable<MovieReview[]> {
    const movieReviews = this.reviews.filter(review => review.movieId === movieId);
    return of(movieReviews).pipe(delay(300));
  }

  getMovieComments(movieId: number): Observable<MovieComment[]> {
    const movieComments = this.comments.filter(comment => comment.movieId === movieId);
    return of(movieComments).pipe(delay(300));
  }

  addRating(request: RatingRequest): Observable<{ success: boolean; message: string }> {
    const existingReview = this.reviews.find(r => r.movieId === request.movieId && r.userId === 1);
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = request.rating;
      existingReview.review = request.review || existingReview.review;
    } else {
      // Add new review
      const newReview: MovieReview = {
        id: this.reviews.length + 1,
        movieId: request.movieId,
        userId: 1,
        userName: 'Current User',
        rating: request.rating,
        review: request.review || '',
        likes: 0,
        createdAt: new Date()
      };
      this.reviews.push(newReview);
    }

    // Update movie average rating
    this.updateMovieRating(request.movieId);

    return of({ success: true, message: 'Rating added successfully' }).pipe(delay(500));
  }

  addComment(request: CommentRequest): Observable<{ success: boolean; message: string }> {
    const newComment: MovieComment = {
      id: this.comments.length + 1,
      movieId: request.movieId,
      userId: 1,
      userName: 'Current User',
      comment: request.comment,
      likes: 0,
      createdAt: new Date()
    };
    this.comments.push(newComment);

    return of({ success: true, message: 'Comment added successfully' }).pipe(delay(500));
  }

  likeReview(reviewId: number): Observable<{ success: boolean; message: string }> {
    const review = this.reviews.find(r => r.id === reviewId);
    if (review) {
      review.likes++;
      review.isLiked = true;
    }
    return of({ success: true, message: 'Review liked' }).pipe(delay(300));
  }

  likeComment(commentId: number): Observable<{ success: boolean; message: string }> {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      comment.likes++;
      comment.isLiked = true;
    }
    return of({ success: true, message: 'Comment liked' }).pipe(delay(300));
  }

  getTheaters(city: string): Observable<Theater[]> {
    const allTheaters: Theater[] = [
      { 
        id: 1, 
        name: 'PVR Cinemas', 
        location: 'Phoenix Mall, Mumbai', 
        showTimes: ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM'],
        amenities: ['Dolby Atmos', 'Recliner Seats', 'Food Service', 'Online Booking'],
        rating: 4.5
      },
      { 
        id: 2, 
        name: 'INOX', 
        location: 'R-City Mall, Mumbai', 
        showTimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'],
        amenities: ['Dolby Digital', 'Premium Seats', 'Snack Bar'],
        rating: 4.3
      },
      { 
        id: 3, 
        name: 'Cinepolis', 
        location: 'Viviana Mall, Mumbai', 
        showTimes: ['12:00 PM', '4:00 PM', '8:00 PM'],
        amenities: ['Dolby Atmos', 'Recliner Seats', 'Food Service'],
        rating: 4.2
      }
    ];

    const cityTheaters = allTheaters.filter(theater => 
      theater.location.toLowerCase().includes(city.toLowerCase())
    );

    return of(cityTheaters).pipe(delay(300));
  }

  createBooking(bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>): Observable<{ success: boolean; message: string; booking?: Booking }> {
    const newBooking: Booking = {
      ...bookingData,
      id: this.bookings.length + 1,
      bookingCode: `BMS${String(this.bookings.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };

    this.bookings.push(newBooking);
    return of({ success: true, message: 'Booking created successfully', booking: newBooking }).pipe(delay(1000));
  }

  getUserBookings(userId: number): Observable<Booking[]> {
    const userBookings = this.bookings.filter(booking => booking.userId === userId);
    return of(userBookings).pipe(delay(300));
  }

  cancelBooking(bookingId: number): Observable<{ success: boolean; message: string }> {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'cancelled';
      return of({ success: true, message: 'Booking cancelled successfully' }).pipe(delay(500));
    }
    return of({ success: false, message: 'Booking not found' }).pipe(delay(500));
  }

  rescheduleBooking(bookingId: number, newShowTime: string, newDate: string): Observable<{ success: boolean; message: string }> {
    const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex > -1) {
      this.bookings[bookingIndex].showTime = newShowTime;
      this.bookings[bookingIndex].bookingDate = newDate;
      return of({ success: true, message: 'Booking rescheduled successfully' });
    }
    return of({ success: false, message: 'Booking not found' });
  }

  addMovie(movie: Omit<Movie, 'id'>): Observable<Movie> {
    const newMovie: Movie = {
      id: Math.max(...this.movies.map(m => m.id)) + 1,
      ...movie
    };
    this.movies.push(newMovie);
    return of(newMovie).pipe(delay(500));
  }

  updateMovie(movieToUpdate: Movie): Observable<Movie> {
    const movieIndex = this.movies.findIndex(m => m.id === movieToUpdate.id);
    this.movies[movieIndex] = movieToUpdate;
    return of(movieToUpdate).pipe(delay(500));
  }

  deleteMovie(movieId: number): Observable<{ success: boolean }> {
    this.movies = this.movies.filter(m => m.id !== movieId);
    return of({ success: true }).pipe(delay(500));
  }

  getAllComments(): Observable<MovieComment[]> {
    // In a real app, this might be paginated.
    return of(this.comments).pipe(delay(500));
  }

  deleteComment(commentId: number): Observable<{ success: boolean }> {
    this.comments = this.comments.filter(c => c.id !== commentId);
    return of({ success: true }).pipe(delay(500));
  }

  private updateMovieRating(movieId: number): void {
    const movieReviews = this.reviews.filter(review => review.movieId === movieId);
    if (movieReviews.length > 0) {
      const totalRating = movieReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / movieReviews.length;
      
      const movie = this.movies.find(m => m.id === movieId);
      if (movie) {
        movie.averageRating = Math.round(averageRating * 10) / 10;
        movie.totalRatings = movieReviews.length;
      }
    }
  }
}
