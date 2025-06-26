import { Component, OnInit } from '@angular/core';
import { AuthService, User, ChangePasswordRequest, UpdateProfileRequest } from '../services/auth.service';
import { City } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isEditingProfile: boolean = false;
  isChangingPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Profile form data
  profileData: UpdateProfileRequest  = {
    name: '',
    phone: '',
    city: '',
    dateOfBirth: '',
    gender: '',
    email: ''
  };

  // Password change form data
  passwordData: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  cities : City[] = [];
  genders: string[] = ['Male', 'Female', 'Other'];

  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.getCities();
  }

  loadUserProfile(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileData = {
        name: this.currentUser.fullName,
        phone: this.currentUser.phone || '',
        city: this.currentUser.city || '',
        dateOfBirth: this.currentUser.dateOfBirth ? new Date(this.currentUser.dateOfBirth).toISOString().split('T')[0] : '',
        gender: this.currentUser.gender || 'Not specified',
        email: this.currentUser.email || ''
      };
    }
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

  startEditProfile(): void {
    this.isEditingProfile = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEditProfile(): void {
    this.isEditingProfile = false;
    this.loadUserProfile(); // Reset to original values
  }

  updateProfile(): void {
    if (!this.validateProfileForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare the request body as required by the new API
    const selectedCity = this.cities.find(c => c.cityName === this.profileData.city);
    const cityId = selectedCity ? selectedCity.cityId : null;
    const updateRequest = {
      name: this.profileData.name,
      phone: this.profileData.phone,
      city: this.profileData.city,
      dateOfBirth: this.profileData.dateOfBirth,
      gender: this.profileData.gender,
      avatar: this.profileData.avatar,
      email: this.profileData.email,
      // For the API body
      cityId: cityId
    };

    // Call the updated AuthService method
    this.authService.updateProfile({
      ...updateRequest,
      city: this.profileData.city // keep for local update
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = response.message;
          this.isEditingProfile = false;
          this.currentUser = response.user || this.currentUser;
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Profile update failed. Please try again.';
        console.error('Profile update error:', error);
      }
    });
  }

  startChangePassword(): void {
    this.isChangingPassword = true;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelChangePassword(): void {
    this.isChangingPassword = false;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  changePassword(): void {
  if (!this.validatePasswordForm()) {
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';
  this.successMessage = '';

  this.authService.changePassword(this.passwordData).subscribe({
    next: (response) => {
      this.isLoading = false;
      if (response.success) {
        this.successMessage = response.message;
        this.isChangingPassword = false;
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } else {
        this.errorMessage = response.message;
      }
    },
    error: (error) => {
      this.isLoading = false;
      this.errorMessage = 'Password change failed. Please try again.';
      console.error('Password change error:', error);
    }
  });
}


  validateProfileForm(): boolean {
    if (!this.profileData.name.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }
    if (!this.profileData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.profileData.email)) {
      this.errorMessage = 'Valid email is required';
      return false;
    }
    if (!this.profileData.city) {
      this.errorMessage = 'Please select a city';
      return false;
    }
    return true;
  }

  validatePasswordForm(): boolean {
    if (!this.passwordData.currentPassword) {
      this.errorMessage = 'Current password is required';
      return false;
    }

    if (!this.passwordData.newPassword) {
      this.errorMessage = 'New password is required';
      return false;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters long';
      return false;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'New passwords do not match';
      return false;
    }

    return true;
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  logout(): void {
    this.authService.logout();
    // Redirect to login page
    window.location.href = '/login';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getMemberSince(): string {
    if (this.currentUser?.createdAt) {
      return new Date(this.currentUser.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    return 'N/A';
  }
}
