import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MovieManagementComponent } from './movie-management/movie-management.component';
import { CommentModerationComponent } from './comment-moderation/comment-moderation.component';


@NgModule({
  declarations: [
    AdminComponent,
    LayoutComponent,
    DashboardComponent,
    MovieManagementComponent,
    CommentModerationComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule
  ]
})
export class AdminModule { }
