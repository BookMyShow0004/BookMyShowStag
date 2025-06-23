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
  captchaText = '';
  userCaptcha = '';

  cities : City[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.generateCaptcha();
    this.getCities();
  }

  generateCaptcha(): void {
    this.captchaText = this.authService.generateCaptcha();
  }

  getCities(): void {
    this.authService.getcityData().subscribe({
      next: (response) => {
        this.cities = response; // Correct way: assign the whole array
      },
      error: (err) => {
        console.error('Failed to load cities:', err);
      },
    });
  }

  onRegister(): void {
    if (this.userCaptcha.toLowerCase() !== this.captchaText.toLowerCase()) {
      this.errorMessage = 'Invalid captcha';
      this.generateCaptcha();
      this.userCaptcha = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = response.message;
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.errorMessage = response.message;
          this.generateCaptcha();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Registration failed. Please try again.';
        this.generateCaptcha();
        console.error('Registration error:', error);
      },
    });
  }

  validateForm(): boolean {
    if (!this.registerData.fullName.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }

    if (!this.registerData.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    if (!this.registerData.password) {
      this.errorMessage = 'Password is required';
      return false;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return false;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    if (!this.registerData.cityId) {
      this.errorMessage = 'Please select a city';
      return false;
    }

    return true;
  }
}
