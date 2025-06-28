import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAuthGuard } from './admin-auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';
import { MovieManagementComponent } from './movie-management/movie-management.component';
import { CommentModerationComponent } from './comment-moderation/comment-moderation.component';
import { ShowManagementComponent } from './show-management/show-management.component';
import { AddSeatsComponent } from './add-seats/add-seats.component';
import { ShowSeatManagementComponent } from './show-seat-management/show-seat-management.component';
import { TheatreManagementComponent } from './theatre-management/theatre-management.component';
import { BookingManagementComponent } from './booking-management/booking-management.component';
import { CityManagementComponent } from './city-management/city-management.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AdminAuthGuard],
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'movies', component: MovieManagementComponent },
      { path: 'theatres', component: TheatreManagementComponent },
      { path: 'shows', component: ShowManagementComponent },
      { path: 'comments', component: CommentModerationComponent },
      { path: 'seats', component: AddSeatsComponent },
      { path: 'show-seats', component: ShowSeatManagementComponent },
      { path: 'bookings', component: BookingManagementComponent },
      { path: 'cities', component: CityManagementComponent },
      { path: 'users', component: UserManagementComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
