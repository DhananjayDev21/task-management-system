import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task } from '../../../models/model';
import { Tasks } from '../../../services/tasks';
import { TaskCreation } from '../task-creation/task-creation';
import { TaskInsights } from '../task-insights/task-insights';

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.html',
  styleUrls: ['./my-tasks.scss'],
  standalone: true,
  imports: [MatDividerModule, CommonModule, MatExpansionModule, MatTabsModule, TaskInsights],
  encapsulation: ViewEncapsulation.None
})
export class MyTasks implements OnInit {
  tasks: Task[] = [];
  groupedTasks: any = [];

  constructor(
    private dialog: MatDialog,
    private taskService: Tasks,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.getTasks();
  }

  getTasks() {
    this.taskService.getTasks().subscribe({
      next: (res: any) => {
        this.tasks = res;
        this.groupTasksByDate();
      },
      error: (err: any) => {
        console.error('Error fetching tasks:', err);
      }
    });
  }

  groupTasksByDate() {
    const groups: any = {};

    this.tasks.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // ✅ filter out tasks where dueDate + dueTime < now
    const validTasks = this.tasks.filter(task => {
      const dueDateTime = new Date(task.dueDate + 'T' + (task.dueTime || '23:59:59'));

      task.isOverDue = dueDateTime < new Date();

      return dueDateTime >= new Date(); // keep only active & future tasks
    });

    validTasks.forEach(task => {
      const startDate = new Date(task.startDate);
      let label: string;

      if (startDate.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (startDate.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else if (startDate.toDateString() === tomorrow.toDateString()) {
        label = 'Tomorrow';
      } else {
        label = startDate.toDateString();
      }

      if (!groups[label]) groups[label] = [];

      groups[label].push(task);
    });


    // Convert → array with filters
    this.groupedTasks = Object.keys(groups).map(label => {
      const tasks = groups[label];
      const availableStatuses = [...new Set(tasks.map((t: any) => t.status))];
      const availablePriorities = [...new Set(tasks.map((t: any) => t.priority))];
      const arr = ['All', ...availableStatuses, ...availablePriorities];

      return {
        label,
        tasks,
        activeFilter: 'All',
        filters: arr.map(f => ({
          name: f,
          count: f === 'All'
            ? tasks.length
            : tasks.filter((t: any) => t.status === f || t.priority === f).length,
        })),

        filteredTasks: tasks

      };
    });
  }


  setFilter(group: any, filterName: string) {
    group.activeFilter = filterName;

    // recompute filteredTasks here
    if (filterName === 'All') {
      group.filteredTasks = group.tasks;
    } else {
      group.filteredTasks = group.tasks.filter(
        (task: any) => task.status === filterName || task.priority === filterName
      );
    }
  }

  // ✅ Filter tasks inside a group
  getFilteredTasks(group: any) {

    if (group.activeFilter === 'All') return group.tasks;

    return group.tasks.filter((task: any) =>
      task.status === group.activeFilter || task.priority === group.activeFilter
    );
  }


  openTaskCreation() {
    const dialogRef = this.dialog.open(TaskCreation, { width: '600px' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTasks();
      }
    });
  }

  // my-tasks.ts
  editTask(task: any) {
    const dialogRef = this.dialog.open(TaskCreation, {
      width: '600px',
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTasks();  // refresh after update
      }
    });
  }


  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.snackBar.open('Task deleted successfully 🗑️', 'Close', { duration: 3000 });
        this.getTasks();
      },
      error: err => {
        this.snackBar.open('Failed to delete task ❌', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

}
