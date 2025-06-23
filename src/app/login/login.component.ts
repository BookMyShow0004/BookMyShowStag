import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../services/auth.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  private returnUrl: string = '/dashboard';
  private openBookingFor: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
      this.openBookingFor = params['openBookingFor'] || null;
    });
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const loginRequest: LoginRequest = {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.user) {
          // Check user role for redirection
          const targetUrl = response.user.role === 'Admin' ? '/admin' : this.returnUrl;
          const queryParams = this.openBookingFor ? { openBookingFor: this.openBookingFor } : {};
          this.router.navigate([targetUrl], { queryParams });
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'An unexpected error occurred. Please try again.';
        console.error('Login error:', err);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSocialLogin(provider: string) {
    console.log(`Logging in with ${provider}`);
    // Add your social login logic here
  }

  onForgotPassword() {
    console.log('Forgot password clicked');
    // Add your forgot password logic here
  }
}

