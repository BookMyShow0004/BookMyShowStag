import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { CityService, City } from '../../services/city.service';
import { AlertService } from '../../shared/alert.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  cities: any[] = [];
  isLoading = true;
  error: string | null = null;
  roles: string[] = ['User', 'Admin'];
  editUserId: number | null = null;
  editUser: User = { userId: 0, fullName: '', email: '', role: '', cityId: 0 };

  userForm: FormGroup;
  userEditMode = false;
  editingUserId: number | null = null;

  constructor(private userService: UserService, private fb: FormBuilder, private cityService: CityService, private alertService: AlertService) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      cityId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchUsers();
   this.fetchCities();
  }

  fetchCities() {
     this.cityService.getCities().subscribe({
      next: (cities) => { this.cities = cities; },
      error: () => { this.error = 'Failed to load cities'; }
    });
  }

  fetchUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        // The API returns city as a string, not cityId
        
        console.log(this.cities);
        this.users = data.map(u => {
          // console.log(data)
          // Try to map city string to cityId if possible
          const cityObj = this.cities.find(c => c.cityName === u.city);

          return {
            ...u,
            cityId: cityObj ? cityObj.cityId : 0, // fallback to 0 if not found
            city: u.city // always keep city string for display
          };
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.isLoading = false;
      }
    });
  }

  onUserFormSubmit() {
    if (this.userForm.invalid) return;
    const formValue = this.userForm.value;
    this.isLoading = true;
    if (this.userEditMode && this.editingUserId !== null) {
      // Edit existing user
      const updatedUser = {
        userId: this.editingUserId,
        fullName: formValue.fullName,
        email: formValue.email,
        role: formValue.role,
        cityId: +formValue.cityId
      };
      this.userService.adminUpdateUser(updatedUser).subscribe({
        next: (updatedUserFromApi) => {
          const idx = this.users.findIndex(u => u.userId === this.editingUserId);
          // Find city name for the updated cityId
          const cityObj = this.cities.find(c => c.cityId === updatedUserFromApi.cityId);
          const cityName = cityObj ? cityObj.cityName : '';
          // Patch the updated user with city string for list display
          const patchedUser = { ...updatedUserFromApi, city: cityName };
          if (idx > -1) this.users[idx] = patchedUser;
          this.hideUserForm();
          this.isLoading = false;
          this.alertService.showAlert('User updated successfully!');
          this.fetchUsers();
        },
        error: () => {
          this.error = 'Failed to update user';
          this.isLoading = false;
        }
      });
    }
  }

  startEdit(user: User) {
    this.editUserId = user.userId;
    this.editUser = { ...user };
    this.userEditMode = true;
    this.editingUserId = user.userId;
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      cityId: user.cityId
    });
  }

  hideUserForm() {
    this.userForm.reset();
    this.userEditMode = false;
    this.editingUserId = null;
  }

  deleteUser(userId: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.isLoading = true;
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.userId !== userId);
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to delete user';
        this.isLoading = false;
      }
    });
  }
}
