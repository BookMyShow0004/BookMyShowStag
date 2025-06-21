import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor() { }

  onLogin(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;

      // Simulate API call
      setTimeout(() => {
        console.log('Login Data:', {
          email: this.email,
          password: this.password,
          rememberMe: this.rememberMe
        });

        this.isLoading = false;
        // Add your actual login logic here
        // this.authService.login(this.email, this.password).subscribe(...)
      }, 2000);
    }
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

