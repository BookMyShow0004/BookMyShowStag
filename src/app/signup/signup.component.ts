import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  phoneNumber: string = '';
  agreeToTerms: boolean = false;
  subscribeNewsletter: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  constructor() { }

  onSignup(form: NgForm) {
    if (form.valid && this.validatePasswords() && this.agreeToTerms) {
      this.isLoading = true;

      // Simulate API call
      setTimeout(() => {
        console.log('Signup Data:', {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
          phoneNumber: this.phoneNumber,
          subscribeNewsletter: this.subscribeNewsletter
        });

        this.isLoading = false;
        // Add your actual signup logic here
        // this.authService.signup(signupData).subscribe(...)
      }, 2000);
    }
  }

  validatePasswords(): boolean {
    return this.password === this.confirmPassword;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSocialSignup(provider: string) {
    console.log(`Signing up with ${provider}`);
    // Add your social signup logic here
  }

  getPasswordStrength(): string {
    if (this.password.length === 0) return '';
    if (this.password.length < 6) return 'weak';
    if (this.password.length < 8) return 'medium';
    if (this.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)) {
      return 'strong';
    }
    return 'medium';
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return '#e53e3e';
      case 'medium': return '#dd6b20';
      case 'strong': return '#38a169';
      default: return '#e2e8f0';
    }
  }
}
