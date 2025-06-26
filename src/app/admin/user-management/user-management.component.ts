import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  error: string | null = null;
  roles: string[] = ['User', 'Admin'];
  editUserId: number | null = null;
  editUser: User = { userId: 0, fullName: '', email: '', role: '' };

  userForm: FormGroup;
  userEditMode = false;
  editingUserId: number | null = null;

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
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
      const updatedUser: User = {
        userId: this.editingUserId,
        ...formValue
      };
      this.userService.updateUser(updatedUser).subscribe({
        next: () => {
          const idx = this.users.findIndex(u => u.userId === this.editingUserId);
          if (idx > -1) this.users[idx] = updatedUser;
          this.hideUserForm();
          this.isLoading = false;
        },
        error: () => {
          this.error = 'Failed to update user';
          this.isLoading = false;
        }
      });
    } else {
      // Add new user
      this.userService.addUser(formValue).subscribe({
        next: (newUser) => {
          this.users.push(newUser);
          this.hideUserForm();
          this.isLoading = false;
        },
        error: () => {
          this.error = 'Failed to add user';
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
      role: user.role
    });
  }

  saveEdit(user: User) {
    // Only update if something changed
    if (
      user.fullName !== this.editUser.fullName ||
      user.role !== this.editUser.role
    ) {
      this.userService.updateUser(this.editUser).subscribe({
        next: () => {
          user.fullName = this.editUser.fullName;
          user.role = this.editUser.role;
          this.editUserId = null;
        },
        error: () => {
          this.error = 'Failed to update user';
        }
      });
    } else {
      this.editUserId = null;
    }
  }

  cancelEdit() {
    this.editUserId = null;
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

  changeRole(user: User, newRole: string) {
    if (user.role === newRole) return;
    this.userService.updateUserRole(user.userId, newRole).subscribe({
      next: () => {
        user.role = newRole;
      },
      error: () => {
        this.error = 'Failed to update role';
      }
    });
  }
}
