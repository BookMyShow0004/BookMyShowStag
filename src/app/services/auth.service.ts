import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: 'admin' | 'user';
  cityId: number;
  // Optional fields that may be part of the profile but not login response
  phone?: string;
  city?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  preferences?: string[];
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  cityId: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name: string;
  phone: string;
  city: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:5001/api/Users'; 
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(request: LoginRequest): Observable<{ success: boolean; message: string; user?: User }> {
    return this.http.post<User>(`${this.apiUrl}/Login`, { email: request.email, password: request.password })
      .pipe(
        map(user => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          if (request.rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          } else {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
          }
          return { success: true, message: 'Login successful', user };
        }),
        catchError(error => {
          const message = error.error?.title || (typeof error.error === 'string' ? error.error : 'Invalid email or password');
          return of({ success: false, message });
        })
      );
  }

  register(request: RegisterRequest): Observable<{ success: boolean; message: string }> {
    if (request.password !== request.confirmPassword) {
      return of({ success: false, message: 'Passwords do not match' });
    }

    const registrationData = {
      FullName: request.fullName,
      Email: request.email,
      PasswordHash: request.password, 
      CityId: request.cityId
    };

    return this.http.post(`${this.apiUrl}/Register`, registrationData, { responseType: 'text' }).pipe(
      map(response => ({ success: true, message: response })),
      catchError(error => {
        let message = 'Registration failed';
        if (typeof error.error === 'string') {
            message = error.error;
        } else if (error.error && error.error.errors) {
            message = Object.values(error.error.errors).flat().join(' ');
        } else if (error.error) {
            message = error.error;
        }
        return of({ success: false, message });
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  }

  changePassword(request: ChangePasswordRequest): Observable<{ success: boolean; message: string }> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of({ success: false, message: 'User not authenticated' });
    }

    // This functionality should ideally be handled by a dedicated backend endpoint.
    // The logic below is a placeholder and may not work without a backend implementation.
    console.warn('changePassword is a mock implementation.');
    return of({ success: false, message: 'Password change not implemented on the backend.'});
  }

  updateProfile(request: UpdateProfileRequest): Observable<{ success: boolean; message: string; user?: User }> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of({ success: false, message: 'User not authenticated' });
    }
    
    // This functionality should ideally be handled by a dedicated backend endpoint.
    // The logic below is a placeholder and may not work without a backend implementation.
    console.warn('updateProfile is a mock implementation.');
    const updatedUser: User = {
      ...currentUser,
      fullName: request.name,
      phone: request.phone,
      city: request.city,
      dateOfBirth: request.dateOfBirth,
      gender: request.gender,
      avatar: request.avatar
    };

    return of({ success: true, message: 'Profile updated successfully (mock)', user: updatedUser }).pipe(
      tap(() => {
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  generateCaptcha(): string {
    // This is a mock. Real captcha should be handled with a backend service.
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
