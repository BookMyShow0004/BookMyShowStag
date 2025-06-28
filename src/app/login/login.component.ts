import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../services/auth.service';
import { AlertService } from '../shared/alert.service';
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
  captchaToken: string | null = null;
  captchaError: boolean = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.role === 'Admin') {
          this.router.navigate(['/admin']);
          return;
        } else if (user) {
          this.router.navigate(['/dashboard']);
          return;
        }
      } catch (e) {
      }
    }

    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
      this.openBookingFor = params['openBookingFor'] || null;
    });
  }

  onCaptchaResolved(token: string | null): void {
  this.captchaToken = token;
  this.captchaError = !token;
}

  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  onLogin(form: NgForm) {
    if (form.invalid || !this.captchaToken) {
      this.showToastMessage('Please complete all fields and solve the captcha.', 'error');
      this.captchaError = !this.captchaToken;
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
          const targetUrl = response.user.role === 'Admin' ? '/admin' : this.returnUrl;
          const queryParams = this.openBookingFor ? { openBookingFor: this.openBookingFor } : {};
          this.router.navigate([targetUrl], { queryParams });
        } else {
          this.showToastMessage(response.message, 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showToastMessage('An unexpected error occurred. Please try again.', 'error');
        console.error('Login error:', err);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSocialLogin(provider: string) {
    console.log(`Logging in with ${provider}`);
  }

  onForgotPassword() {
    console.log('Forgot password clicked');
  }
}

