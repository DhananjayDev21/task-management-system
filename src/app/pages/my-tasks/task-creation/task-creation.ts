import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Tasks } from '../../../services/tasks';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task } from '../../../models/model';



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
  statuses = ['pending', 'in-progress', 'completed', 'on-hold'];
  priorities = ['low', 'medium', 'high'];
  categories = [
    'Development',
    'Database',
    'Testing',
    'Performance',
    'Security',
    'Documentation',
    'Process',
    'Frontend',
    'Bugfix',
    'Design',
    'Maintenance',
    'Release',
    'Presentation',
    'Compliance',
    'DevOps',
    'Feature',
    'Analytics',
    'Work'
  ];
  tags: FormArray;   // <-- define tags as a property

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskCreation>,
    private taksService: Tasks,
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
      tags: this.fb.array([]),   // still part of form
      createdBy: ['Dhananjay'],
      createdAt: [new Date().toISOString()],
      updatedAt: [new Date().toISOString()]
    });

    // assign FormArray to property once
    this.tags = this.taskForm.get('tags') as FormArray;

    if (data) {

      this.taskForm.patchValue({
        ...data,
        startDate: new Date(data.startDate), // convert string back to Date
        dueDate: new Date(data.dueDate),
        category: data.category   // 👈 explicitly set category
      });


      // clear old tags first (to avoid duplicates)
      this.tags.clear();

      if (data.tags?.length) {
        data.tags.forEach(tag => this.tags.push(this.fb.control(tag)));
      }
    }

  }

  addTag(tagInput: HTMLInputElement) {
    const value = tagInput.value.trim();
    if (value) this.tags.push(this.fb.control(value));
    tagInput.value = '';
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  submitTask() {
    if (this.taskForm.valid) {
      const task = { ...this.taskForm.value };

      // format dates back to yyyy-mm-dd
      task.startDate = new Date(task.startDate).toLocaleDateString('en-CA');
      task.dueDate = new Date(task.dueDate).toLocaleDateString('en-CA');

      // always refresh updatedAt
      task.updatedAt = new Date().toISOString();

      // Create or Update (inside TaskCreation)
      if (this.data?.id) {
        this.taksService.updateTask(this.data.id, task).subscribe({
          next: res => {
            this.snackBar.open('Task updated successfully ✅', 'Close', { duration: 3000 });
            this.dialogRef.close(res);
          },
          error: err => {
            this.snackBar.open('Failed to update task ❌', 'Close', { duration: 3000 });
            console.error(err);
          }
        });
      } else {
        this.taksService.createTask(task).subscribe({
          next: res => {
            this.snackBar.open('Task created successfully ✅', 'Close', { duration: 3000 });
            this.dialogRef.close(res);
          },
          error: err => {
            this.snackBar.open('Failed to create task ❌', 'Close', { duration: 3000 });
            console.error(err);
          }
        });
      }

    } else {
      console.warn('⚠️ Task form is invalid', this.taskForm.value);
    }
  }



  closeDialog() {
    this.dialogRef.close();
  }
}

