import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, City, RegisterRequest } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  registerData: RegisterRequest = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
    cityId: null as any,
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  cities : City[] = [];

  showPassword = false;
  showConfirmPassword = false;

  passwordErrors: string[] = [];

  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  ngOnInit(): void {
    this.getCities();
  }

  getCities(): void {
    this.authService.getcityData().subscribe({
      next: (response) => {
        this.cities = response;
      },
      error: (err) => {
        this.showToastMessage('Failed to load cities.', 'error');
      },
    });
  }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.validateForm()) {
      return;
    }
    this.isLoading = true;
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = response.message;
          this.showToastMessage(this.successMessage, 'success');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.errorMessage = response.message;
          this.showToastMessage(this.errorMessage, 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Registration failed. Please try again.';
        this.showToastMessage(this.errorMessage, 'error');
      },
    });
  }

  validateForm(): boolean {
    this.passwordErrors = [];

    if (!this.registerData.fullName.trim()) {
      this.errorMessage = 'Name is required';
      this.showToastMessage(this.errorMessage, 'error');
      return false;
    }

    if (!this.registerData.email.trim()) {
      this.errorMessage = 'Email is required';
      this.showToastMessage(this.errorMessage, 'error');
      return false;
    }

    if (!this.registerData.password) {
      this.passwordErrors.push('Password is required');
      this.showToastMessage('Password is required', 'error');
      return false;
    }
    const password = this.registerData.password;
    if (password.length < 8) {
      this.passwordErrors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      this.passwordErrors.push('At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      this.passwordErrors.push('At least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      this.passwordErrors.push('At least one number');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      this.passwordErrors.push('At least one special character');
    }
    if (this.passwordErrors.length > 0) {
      this.showToastMessage(this.passwordErrors.join(', '), 'error');
      return false;
    }
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.passwordErrors.push('Passwords do not match');
      this.showToastMessage('Passwords do not match', 'error');
      return false;
    }

    if (!this.registerData.cityId) {
      this.errorMessage = 'Please select a city';
      this.showToastMessage(this.errorMessage, 'error');
      return false;
    }

    return true;
  }
}
