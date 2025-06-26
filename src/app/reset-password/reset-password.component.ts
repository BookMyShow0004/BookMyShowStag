import { Component } from '@angular/core';
import { ResetPasswordService } from './reset-password.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  email: string = '';
  isLoading: boolean = false;
  message: string = '';

  constructor(private resetPasswordService: ResetPasswordService) {}

  onSubmit() {
    if (!this.email) {
      this.message = 'Please enter your email.';
      return;
    }
    this.isLoading = true;
    this.resetPasswordService.resetPassword(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = 'A new password has been sent to your email if it is registered.';
      },
      error: (err) => {
        this.isLoading = false;
        this.message = 'Failed to reset password. Please try again later.';
      }
    });
  }
}
