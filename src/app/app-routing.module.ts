import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { ShowListComponent } from './show-list/show-list.component';
import { SeatSelectionComponent } from './seat-selection/seat-selection.component';
import { TheatresComponent } from './theatres/theatres.component';
import { BookingComponent } from './booking/booking.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'movie/:id', component: MovieDetailsComponent },
  { path: 'theatres', component: TheatresComponent },
  { path: 'theatres/:id', component: TheatresComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'shows/:movieId/:theatreId', component: ShowListComponent },
  { path: 'seat-selection/:showId', component: SeatSelectionComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
