import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MovieManagementComponent } from './movie-management/movie-management.component';
import { CommentModerationComponent } from './comment-moderation/comment-moderation.component';
import { TheaterManagementComponent } from './theater-management/theater-management.component';
import { ShowManagementComponent } from './show-management/show-management.component';
import { AddSeatsComponent } from './add-seats/add-seats.component';
import { ShowSeatManagementComponent } from './show-seat-management/show-seat-management.component';

@NgModule({
  declarations: [
    AdminComponent,
    LayoutComponent,
    DashboardComponent,
    MovieManagementComponent,
    CommentModerationComponent,
    TheaterManagementComponent,
    ShowManagementComponent,
    AddSeatsComponent,
    ShowSeatManagementComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class AdminModule { }
