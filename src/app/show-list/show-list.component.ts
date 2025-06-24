import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { AlertService } from '../shared/alert.service';

@Component({
  selector: 'app-show-list',
  templateUrl: './show-list.component.html',
  styleUrls: ['./show-list.component.css']
})
export class ShowListComponent implements OnInit {
  shows: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    const movieId = Number(this.route.snapshot.paramMap.get('movieId'));
    const theaterId = Number(this.route.snapshot.paramMap.get('theaterId'));
    this.movieService.getShowTimeByMovieAndTheater(movieId, theaterId).subscribe({
      next: (shows) => {
        this.shows = shows;
        this.isLoading = false;
      },
      error: () => {
        this.handleError('Failed to load shows.');
        this.isLoading = false;
      }
    });
  }

  selectShow(show: any): void {
    // Navigate to seat selection page for this show
    this.router.navigate(['/seat-selection', show.showId]);
  }

  handleError(message: string): void {
    this.alertService.showAlert(message);
  }
}
