import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RecaptchaModule, RecaptchaFormsModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';

import { BookTicketsComponent } from './book-tickets/book-tickets.component';
import { ProfileComponent } from './profile/profile.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { CommonModule } from '@angular/common';
import { ShowListComponent } from './show-list/show-list.component';
import { SeatSelectionComponent } from './seat-selection/seat-selection.component';
import { TheatresComponent } from './theatres/theatres.component';
import { BookingComponent } from './booking/booking.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    BookTicketsComponent,
    ProfileComponent,
    MovieDetailsComponent,
    TheatresComponent,
    MyBookingsComponent,
    ShowListComponent,
    SeatSelectionComponent,
    BookingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    CommonModule
  ],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: '6LeSkGsrAAAAABOLsVNfYPC7XTKKqEQekDgfeb6J'
      } as RecaptchaSettings
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
