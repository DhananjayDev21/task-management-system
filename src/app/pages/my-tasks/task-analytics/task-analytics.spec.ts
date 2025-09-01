import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAnalytics } from './task-analytics';

describe('TaskAnalytics', () => {
  let component: TaskAnalytics;
  let fixture: ComponentFixture<TaskAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskAnalytics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskAnalytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
