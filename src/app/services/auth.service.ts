import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'User';
  cityId: number;
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

export interface City {
  cityId: number;
  cityName: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  cityId: number;
  role: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string; 
}

export interface UpdateProfileRequest {
  name: string;
  phone: string;
  city: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
  email?: string; 
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://vb7dqrjl-5069.inc1.devtunnels.ms/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public getCurrentUsers = localStorage.getItem('currentUser');

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.userId && user.role) {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } else {
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  public ensureUserState(): void {
    if (!this.currentUserSubject.value) {
      this.checkStoredAuth();
    }
  }

  public refreshUserState(): void {
    this.checkStoredAuth();
  }

  login(
    request: LoginRequest
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return this.http
      .post<User>(`${this.apiUrl}/Users/Login`, request, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }), 
      })
      .pipe(
        map((user) => {
          console.log('Inside User', user);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);

          const storage = request.rememberMe ? localStorage : localStorage;
          storage.setItem('currentUser', JSON.stringify(user));

          return { success: true, message: 'Login successful', user };
        }),
        catchError((error) => {
          const message =
            error.error?.title ||
            (typeof error.error === 'string'
              ? error.error
              : 'Invalid email or password');
          return of({ success: false, message });
        })
      );
  }

  getcityData(): Observable<any> {
    return this.http.get<City>(`${this.apiUrl}/Cities`).pipe();
  }

  register(
    request: RegisterRequest
  ): Observable<{ success: boolean; message: string }> {
    if (request.password !== request.confirmPassword) {
      return of({ success: false, message: 'Passwords do not match' });
    }

    const registrationData = {
      FullName: request.fullName,
      Email: request.email,
      Password: request.password,
      CityId: request.cityId,
      Role: request.role,
    };

    return this.http
      .post(`${this.apiUrl}/Users/Register`, registrationData, {
        responseType: 'text',
      })
      .pipe(
        map((response) => ({ success: true, message: response })),
        catchError((error) => {
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

  changePassword(
    request: ChangePasswordRequest
  ): Observable<{ success: boolean; message: string }> {
    const currentUserRaw = localStorage.getItem('currentUser');
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

    if (!currentUser || !currentUser.userId) {
      return of({ success: false, message: 'User not authenticated' });
    }

    const body = {
      oldPassword: request.currentPassword,
      newPassword: request.newPassword,
    };

    return this.http
      .post(
        `${this.apiUrl}/Users/ChangePassword?userId=${currentUser.userId}`,
        body,
        {
          responseType: 'text', 
        }
      )
      .pipe(
        map((responseText: string) => ({
          success: true,
          message: responseText,
        })),
        catchError((error) => {
          const message =
            typeof error.error === 'string'
              ? error.error
              : error.error?.message || 'Password change failed.';
          return of({ success: false, message });
        })
      );
  }

  updateProfile(
    request: UpdateProfileRequest
  ): Observable<{ success: boolean; message: string; user?: User }> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of({ success: false, message: 'User not authenticated' });
    }
    const body = {
      userId: currentUser.userId,
      fullName: request.name,
      email: currentUser.email,
      cityId: currentUser.cityId,
    };
    return this.http
      .put(`${this.apiUrl}/Users/Profile/${currentUser.userId}`, body, {
        responseType: 'text',
      })
      .pipe(
        map((response: any) => ({
          success: true,
          message: response,
          user: {
            ...currentUser,
            fullName: request.name,
            phone: request.phone,
            city: request.city,
            dateOfBirth: request.dateOfBirth,
            gender: request.gender,
            avatar: request.avatar,
          },
        })),
        tap((result) => {
          if (result.success && result.user) {
            this.currentUserSubject.next(result.user);
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            sessionStorage.setItem('currentUser', JSON.stringify(result.user));
          }
        }),
        catchError((error) => {
          const message =
            typeof error.error === 'string'
              ? error.error
              : error.error?.message || 'Profile update failed.';
          return of({ success: false, message });
        })
      );
  }

  getCurrentUser(): User | null {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) return null;
    this.http.get<User>(`${this.apiUrl}/Users/${currentUser.userId}`).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('currentUser', JSON.stringify(user));
      },
      error: (err) => {
      }
    });
    return currentUser;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
