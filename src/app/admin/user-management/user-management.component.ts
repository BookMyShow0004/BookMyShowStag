import { Component, OnInit } from '@angular/core';
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
  roles: string[] = ['User', 'Admin']; // Add more roles as needed

  constructor(private userService: UserService) { }

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
