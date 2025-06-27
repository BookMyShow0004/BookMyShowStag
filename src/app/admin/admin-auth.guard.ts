import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Ensure user state is properly initialized from localStorage
    this.authService.ensureUserState();
    
    // First, check localStorage directly for immediate response
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.role === 'Admin') {
          // If we have a valid admin user in localStorage, allow access immediately
          return true;
        }
      } catch (error) {
        // If JSON parsing fails, remove the invalid data
        localStorage.removeItem('currentUser');
      }
    }

    // If no valid user in localStorage, check the observable
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user && user.role === 'Admin') {
          return true;
        }
        // Redirect to home page if not an admin
        return this.router.createUrlTree(['/']);
      })
    );
  }
}
