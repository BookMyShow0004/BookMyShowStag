import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-show-list',
  templateUrl: './show-list.component.html',
  styleUrls: ['./show-list.component.css']
})
export class ShowListComponent implements OnInit, OnDestroy {
  shows: any[] = [];
  filteredShows: any[] = [];
  isLoading = true;
  errorMessage = '';
  dateFilters: string[] = [];
  selectedDate: string = '';
  currentISTDate: Date = new Date();
  minDate: string = '';
  maxDate: string = '';

  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private router: Router
  ) { }

  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  ngOnInit(): void {
    const movieId = Number(this.route.snapshot.paramMap.get('movieId'));
    const theatreId = Number(this.route.snapshot.paramMap.get('theatreId'));
    this.movieService.getShowTimeByMovieAndTheatre(movieId, theatreId).subscribe({
      next: (shows) => {
        this.shows = shows;
        this.generateDateFilters();
        this.applyDateFilter();
        this.isLoading = false;
      },
      error: () => {
        this.showToastMessage('Failed to load shows.', 'error');
        this.isLoading = false;
      }
    });
    this.updateCurrentISTDate();
  }

  ngOnDestroy(): void {
  }

  updateCurrentISTDate(): void {
    const now = new Date();
    const istOffset = 5.5 * 60;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    this.currentISTDate = new Date(utc + (istOffset * 60000));
  }

  generateDateFilters(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDay = new Date(today);
    lastDay.setDate(today.getDate() + 8);
    const dateSet = new Set<string>();
    this.shows.forEach(show => {
      const showDate = new Date(show.showDateTime);
      showDate.setHours(0, 0, 0, 0);
      if (showDate >= today && showDate <= lastDay) {
        const year = showDate.getFullYear();
        const month = (showDate.getMonth() + 1).toString().padStart(2, '0');
        const day = showDate.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        dateSet.add(dateStr);
      }
    });
    this.dateFilters = Array.from(dateSet).sort();
    if (this.dateFilters.length > 0) {
      this.selectedDate = this.dateFilters[0];
    }
  }

  applyDateFilter(): void {
    if (!this.selectedDate) {
      this.filteredShows = this.shows;
      return;
    }
    this.filteredShows = this.shows.filter(show => {
      const showDate = new Date(show.showDateTime);
      const year = showDate.getFullYear();
      const month = (showDate.getMonth() + 1).toString().padStart(2, '0');
      const day = showDate.getDate().toString().padStart(2, '0');
      const showDateStr = `${year}-${month}-${day}`;
      return showDateStr === this.selectedDate;
    });
  }

  onDateFilterChange(date: string): void {
    this.selectedDate = date;
    this.applyDateFilter();
  }

  selectShow(show: any): void {
    this.router.navigate(['/seat-selection', show.showId]);
  }

  handleError(message: string): void {
    this.showToastMessage(message, 'error');
  }

  isShowStarted(show: any): boolean {
    const showDate = new Date(show.showDateTime);
    const now = new Date();
    return now > showDate;
  }

  onPrevDate(): void {
    const idx = this.dateFilters.indexOf(this.selectedDate);
    if (idx > 0) {
      this.selectedDate = this.dateFilters[idx - 1];
      this.applyDateFilter();
    }
  }

  onNextDate(): void {
    const idx = this.dateFilters.indexOf(this.selectedDate);
    if (idx < this.dateFilters.length - 1) {
      this.selectedDate = this.dateFilters[idx + 1];
      this.applyDateFilter();
    }
  }

  goBack() {
    window.history.back();
  }
}
