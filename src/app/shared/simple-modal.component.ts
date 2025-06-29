import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-simple-modal',
    template: `
    <div class="modal-backdrop" *ngIf="show">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="close" (click)="show = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" (click)="show = false">OK</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }
    .modal-content {
      background: #fff;
      border-radius: 8px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      padding: 0;
    }
    .modal-header, .modal-footer {
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-body {
      padding: 1rem;
    }
    .close {
      background: none;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
    }
  `]
})
export class SimpleModalComponent {
    @Input() show = false;
    @Input() title = 'Message';
    @Input() message = '';
}
