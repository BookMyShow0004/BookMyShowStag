import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService, User } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser$!: Observable<User | null>;
  isDropdownOpen = false;
  showHeader = true;
  private focusHandler = () => this.authService.refreshUserState();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Hide header on login and signup pages
      if (event.url.startsWith('/login') || event.url.startsWith('/signup')) {
        this.showHeader = false;
      } else {
        this.showHeader = true;
      }
    });

    // Refresh user state when window gains focus (user returns to tab)
    window.addEventListener('focus', this.focusHandler);
  }

  ngOnDestroy(): void {
    // Cleanup event listener
    window.removeEventListener('focus', this.focusHandler);
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
