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
    
    this.authService.ensureUserState();
    
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.role === 'Admin') {
          return true;
        }
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user && user.role === 'Admin') {
          return true;
        }
        return this.router.createUrlTree(['/']);
      })
    );
  }
}
