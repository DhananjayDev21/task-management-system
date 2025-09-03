import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tasks } from '../../../services/tasks';
import { Task } from '../../../models/model';
import { LoaderService } from '../../../services/loader';

@Component({
  selector: 'app-task-creation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatChipsModule,
    MatDividerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './task-creation.html',
  styleUrls: ['./task-creation.scss']
})
export class TaskCreation {
  taskForm: FormGroup;
  readonly statuses = ['pending', 'in-progress', 'completed', 'on-hold'] as const;
  readonly priorities = ['low', 'medium', 'high'] as const;
  readonly categories = [
    'Development', 'Database', 'Testing', 'Performance', 'Security', 'Documentation', 'Process',
    'Frontend', 'Bugfix', 'Design', 'Maintenance', 'Release', 'Presentation', 'Compliance',
    'DevOps', 'Feature', 'Analytics', 'Work'
  ] as const;

  get tags(): FormArray {
    return this.taskForm.get('tags') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskCreation>,
    private taskService: Tasks,
    private loader: LoaderService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data?: Task
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['pending', Validators.required],
      priority: ['medium', Validators.required],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      dueDate: ['', Validators.required],
      dueTime: ['', Validators.required],
      category: ['', Validators.required],
      tags: this.fb.array([]),
      createdBy: ['Dhananjay'],
      createdAt: [new Date().toISOString()],
      updatedAt: [new Date().toISOString()]
    });

    if (data) {
      // this.loader.show();
      this.patchFormData(data);
    }
  }

  private patchFormData(task: Task): void {
    this.loader.show();
    this.taskForm.patchValue({
      ...task,
      startDate: new Date(task.startDate),
      dueDate: new Date(task.dueDate),
      category: task.category
    });

    this.tags.clear();
    task.tags?.forEach(tag => this.tags.push(this.fb.control(tag)));
    this.loader.hide();
  }

  addTag(input: HTMLInputElement): void {
    const value = input.value.trim();
    if (value) this.tags.push(this.fb.control(value));
    input.value = '';
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  private formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-CA');
  }

  submitTask(): void {
    this.loader.show();

    if (!this.taskForm.valid) {
      console.warn('⚠️ Task form is invalid', this.taskForm.value);
      return;
    }

    const task: Task = {
      ...this.taskForm.value,
      startDate: this.formatDate(this.taskForm.value.startDate),
      dueDate: this.formatDate(this.taskForm.value.dueDate),
      updatedAt: new Date().toISOString()
    };

    const action$ = this.data?.id
      ? this.taskService.updateTask(this.data.id, task)
      : this.taskService.createTask(task);

    action$.subscribe({
      next: res => {
        this.dialogRef.close(res);
        const message = this.data?.id ? 'Task updated successfully' : 'Task created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.loader.hide();
      },
      error: err => {
        const message = this.data?.id ? 'Failed to update task' : 'Failed to create task';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        console.error(err);
        this.loader.hide();
      }
    });


  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
