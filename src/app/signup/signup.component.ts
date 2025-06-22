import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  registerData: RegisterRequest = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    cityId: null as any
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  captchaText = '';
  userCaptcha = '';
  
  cities = [
    { id: 1, name: 'Mumbai' },
    { id: 2, name: 'Delhi' },
    { id: 3, name: 'Bangalore' },
    { id: 4, name: 'Hyderabad' },
    { id: 5, name: 'Chennai' },
    { id: 6, name: 'Pune' },
    { id: 7, name: 'Kolkata' },
    { id: 8, name: 'Ahmedabad' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    this.captchaText = this.authService.generateCaptcha();
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
      }
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
