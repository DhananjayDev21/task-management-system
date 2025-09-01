import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCreation } from './task-creation';

describe('TaskCreation', () => {
  let component: TaskCreation;
  let fixture: ComponentFixture<TaskCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCreation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCreation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
