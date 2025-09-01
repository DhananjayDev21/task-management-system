import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskInsights } from './task-insights';

describe('TaskInsights', () => {
  let component: TaskInsights;
  let fixture: ComponentFixture<TaskInsights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskInsights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskInsights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
