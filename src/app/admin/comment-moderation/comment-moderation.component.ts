import { Component, OnInit } from '@angular/core';
import { Movie, MovieComment, MovieService } from 'src/app/services/movie.service';

@Component({
  selector: 'app-comment-moderation',
  templateUrl: './comment-moderation.component.html',
  styleUrls: ['./comment-moderation.component.css']
})
export class CommentModerationComponent implements OnInit {
  comments: MovieComment[] = [];
  movies: Movie[] = [];
  isLoading = true;
  private movieTitleMap: Map<number, string> = new Map();

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    // First get movies to create a title map
    this.movieService.getMovies().subscribe(movies => {
      this.movies = movies;
      this.movies.forEach(movie => this.movieTitleMap.set(movie.id, movie.title));

      // Then get comments
      this.movieService.getAllComments().subscribe(comments => {
        this.comments = comments;
        this.isLoading = false;
      });
    });
  }

  getMovieTitle(movieId: number): string {
    return this.movieTitleMap.get(movieId) || 'Unknown Movie';
  }

  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to permanently delete this comment?')) {
      this.movieService.deleteComment(commentId).subscribe(() => {
        // Refresh the list after deletion
        this.comments = this.comments.filter(c => c.id !== commentId);
      });
    }
  }
}
