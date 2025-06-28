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

  profileData: UpdateProfileRequest  = {
    name: '',
    phone: '',
    city: '',
    dateOfBirth: '',
    gender: '',
    email: ''
  };

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

  passwordErrors: string[] = [];

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
        this.cities = response; 
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
    this.loadUserProfile(); 
  }

  updateProfile(): void {
    if (!this.validateProfileForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

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
      cityId: cityId
    };

    this.authService.updateProfile({
      ...updateRequest,
      city: this.profileData.city 
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
    this.passwordErrors = [];
    if (!this.passwordData.currentPassword) {
      this.passwordErrors.push('Current password is required');
      return false;
    }
    const password = this.passwordData.newPassword;
    if (!password) {
      this.passwordErrors.push('New password is required');
      return false;
    }
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
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordErrors.push('New passwords do not match');
    }
    return this.passwordErrors.length === 0;
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
