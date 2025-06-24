import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAuthGuard } from './admin-auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';
import { MovieManagementComponent } from './movie-management/movie-management.component';
import { CommentModerationComponent } from './comment-moderation/comment-moderation.component';
import { TheaterManagementComponent } from './theater-management/theater-management.component';
import { ShowManagementComponent } from './show-management/show-management.component';
import { AddSeatsComponent } from './add-seats/add-seats.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AdminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'movies', component: MovieManagementComponent },
      { path: 'theaters', component: TheaterManagementComponent },
      { path: 'shows', component: ShowManagementComponent },
      { path: 'comments', component: CommentModerationComponent },
      { path: 'seats', component: AddSeatsComponent },
      // Future admin components will be added here
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
