import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TheaterManagementComponent } from './theater-management.component';

describe('TheaterManagementComponent', () => {
  let component: TheaterManagementComponent;
  let fixture: ComponentFixture<TheaterManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TheaterManagementComponent ],
      imports: [ FormsModule, HttpClientTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheaterManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 