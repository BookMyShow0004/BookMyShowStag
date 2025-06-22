import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  city: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  preferences?: string[];
  createdAt: Date;
  role: 'admin' | 'user';
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  city: string;
  captcha: string;
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
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Mock users database
  private users: User[] = [
    {
      id: 1,
      email: 'user@example.com',
      name: 'Test User',
      phone: '+91 9876543210',
      city: 'Mumbai',
      createdAt: new Date(),
      role: 'user'
    },
    {
      id: 2,
      email: 'admin@example.com',
      name: 'Admin User',
      phone: '+91 9876543211',
      city: 'Mumbai',
      createdAt: new Date(),
      role: 'admin'
    }
  ];

  // Mock passwords (in real app, these would be hashed)
  private passwords: { [email: string]: string } = {
    'user@example.com': 'password123',
    'admin@example.com': 'password123',
    'demo@example.com': 'password123'
  };

  constructor() {
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
    const user = this.users.find(u => u.email === request.email);
    const password = this.passwords[request.email];

    if (!user || password !== request.password) {
      return of({ success: false, message: 'Invalid email or password' }).pipe(delay(1000));
    }

    return of({ success: true, message: 'Login successful', user }).pipe(
      delay(1000),
      tap(() => {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        if (request.rememberMe) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
          sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<{ success: boolean; message: string; user?: User }> {
    // Validate captcha (in real app, this would be server-side validation)
    if (request.captcha.toLowerCase() !== 'bookmyshow') {
      return of({ success: false, message: 'Invalid captcha' }).pipe(delay(1000));
    }

    // Check if user already exists
    if (this.users.find(u => u.email === request.email)) {
      return of({ success: false, message: 'User with this email already exists' }).pipe(delay(1000));
    }

    // Validate password match
    if (request.password !== request.confirmPassword) {
      return of({ success: false, message: 'Passwords do not match' }).pipe(delay(1000));
    }

    // Create new user
    const newUser: User = {
      id: this.users.length + 1,
      email: request.email,
      name: request.name,
      phone: request.phone,
      city: request.city,
      createdAt: new Date(),
      role: 'user'
    };

    this.users.push(newUser);
    this.passwords[request.email] = request.password;

    return of({ success: true, message: 'Registration successful', user: newUser }).pipe(delay(1000));
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
      return of({ success: false, message: 'User not authenticated' }).pipe(delay(1000));
    }

    const currentPassword = this.passwords[currentUser.email];
    if (currentPassword !== request.currentPassword) {
      return of({ success: false, message: 'Current password is incorrect' }).pipe(delay(1000));
    }

    if (request.newPassword !== request.confirmPassword) {
      return of({ success: false, message: 'New passwords do not match' }).pipe(delay(1000));
    }

    this.passwords[currentUser.email] = request.newPassword;
    return of({ success: true, message: 'Password changed successfully' }).pipe(delay(1000));
  }

  updateProfile(request: UpdateProfileRequest): Observable<{ success: boolean; message: string; user?: User }> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of({ success: false, message: 'User not authenticated' }).pipe(delay(1000));
    }

    const updatedUser: User = {
      ...currentUser,
      name: request.name,
      phone: request.phone,
      city: request.city,
      dateOfBirth: request.dateOfBirth,
      gender: request.gender,
      avatar: request.avatar
    };

    // Update user in the array
    const userIndex = this.users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      this.users[userIndex] = updatedUser;
    }

    return of({ success: true, message: 'Profile updated successfully', user: updatedUser }).pipe(
      delay(1000),
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
    // Simple captcha generation (in real app, this would be more complex)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
