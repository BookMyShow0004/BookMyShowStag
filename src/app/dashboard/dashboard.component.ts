import { Component, OnInit } from '@angular/core';

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
}

export interface Theater {
  id: number;
  name: string;
  location: string;
  showTimes: string[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  searchTerm: string = '';
  selectedGenre: string = '';
  selectedLanguage: string = '';
  selectedCity: string = 'Mumbai';
  genres: string[] = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi'];
  languages: string[] = ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi'];
  cities: string[] = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune'];

  isLoading: boolean = true;
  selectedMovie: Movie | null = null;
  showBookingModal: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    // Simulating API call
    setTimeout(() => {
      this.movies = [
        {
          id: 1,
          title: 'Avengers: Endgame',
          genre: 'Action',
          language: 'English',
          duration: '3h 1m',
          rating: 8.4,
          image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@like_202006280402.png,lx-24,ly-617,w-29,l-end/et00444869-lsvhahcatz-portrait.jpg',
          releaseDate: '2023-04-26',
          description: 'The grave course of events set in motion by Thanos that wiped out half the universe...',
          price: 200,
          theaters: [
            { id: 1, name: 'PVR Cinemas', location: 'Phoenix Mall', showTimes: ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM'] },
            { id: 2, name: 'INOX', location: 'R-City Mall', showTimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'] }
          ]
        },
        {
          id: 2,
          title: 'RRR',
          genre: 'Action',
          language: 'Hindi',
          duration: '3h 7m',
          rating: 7.9,
          image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@like_202006280402.png,lx-24,ly-617,w-29,l-end/et00444869-lsvhahcatz-portrait.jpg',
          releaseDate: '2023-03-25',
          description: 'A fictional story about two legendary revolutionaries...',
          price: 180,
          theaters: [
            { id: 3, name: 'Cinepolis', location: 'Viviana Mall', showTimes: ['12:00 PM', '4:00 PM', '8:00 PM'] }
          ]
        },
        {
          id: 3,
          title: 'The Batman',
          genre: 'Action',
          language: 'English',
          duration: '2h 56m',
          rating: 7.8,
          image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@like_202006280402.png,lx-24,ly-617,w-29,l-end/et00444869-lsvhahcatz-portrait.jpg',
          releaseDate: '2023-03-04',
          description: 'Batman ventures into Gotham City\'s underworld...',
          price: 220,
          theaters: [
            { id: 1, name: 'PVR Cinemas', location: 'Phoenix Mall', showTimes: ['1:00 PM', '4:30 PM', '8:00 PM'] }
          ]
        },
        {
          id: 4,
          title: 'Gehraiyaan',
          genre: 'Drama',
          language: 'Hindi',
          duration: '2h 20m',
          rating: 6.5,
          image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@like_202006280402.png,lx-24,ly-617,w-29,l-end/et00444869-lsvhahcatz-portrait.jpg',
          releaseDate: '2023-02-11',
          description: 'A story about relationships, love, and betrayal...',
          price: 150,
          theaters: [
            { id: 2, name: 'INOX', location: 'R-City Mall', showTimes: ['2:00 PM', '5:30 PM', '9:00 PM'] }
          ]
        },
        {
          id: 5,
          title: 'Spider-Man: No Way Home',
          genre: 'Action',
          language: 'English',
          duration: '2h 28m',
          rating: 8.2,
          image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@like_202006280402.png,lx-24,ly-617,w-29,l-end/et00444869-lsvhahcatz-portrait.jpg',
          releaseDate: '2023-12-17',
          description: 'Spider-Man\'s identity is revealed and he asks for help...',
          price: 250,
          theaters: [
            { id: 3, name: 'Cinepolis', location: 'Viviana Mall', showTimes: ['10:30 AM', '2:00 PM', '5:30 PM', '9:00 PM'] }
          ]
        },
        {
          id: 6,
          title: 'Scream',
          genre: 'Horror',
          language: 'English',
          duration: '1h 54m',
          rating: 6.3,
          image: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@like_202006280402.png,lx-24,ly-617,w-29,l-end/et00444869-lsvhahcatz-portrait.jpg',
          releaseDate: '2023-01-14',
          description: 'Twenty-five years after the original series of murders...',
          price: 180,
          theaters: [
            { id: 1, name: 'PVR Cinemas', location: 'Phoenix Mall', showTimes: ['7:00 PM', '10:00 PM'] }
          ]
        }
      ];

      this.filteredMovies = [...this.movies];
      this.isLoading = false;
    }, 1000);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredMovies = this.movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           movie.genre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesGenre = !this.selectedGenre || movie.genre === this.selectedGenre;
      const matchesLanguage = !this.selectedLanguage || movie.language === this.selectedLanguage;

      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedGenre = '';
    this.selectedLanguage = '';
    this.filteredMovies = [...this.movies];
  }

  openBookingModal(movie: Movie): void {
    this.selectedMovie = movie;
    this.showBookingModal = true;
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.selectedMovie = null;
  }

  bookTicket(theater: Theater, showTime: string): void {
    alert(`Booking confirmed for ${this.selectedMovie?.title} at ${theater.name} (${theater.location}) for ${showTime}`);
    this.closeBookingModal();
  }

  getStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating / 2);
    return Array(fullStars).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating / 2);
    const emptyStars = 5 - fullStars;
    return Array(emptyStars).fill(0);
  }
}
