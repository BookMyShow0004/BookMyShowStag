import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastNotificationComponent } from './toast-notification.component';
import { SimpleModalComponent } from './simple-modal.component';

@NgModule({
  declarations: [ToastNotificationComponent, SimpleModalComponent],
  imports: [CommonModule],
  exports: [ToastNotificationComponent, SimpleModalComponent]
})
export class SharedModule { }