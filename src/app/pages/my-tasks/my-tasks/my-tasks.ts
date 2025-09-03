import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Task } from '../../../models/model';
import { Tasks } from '../../../services/tasks';
import { TaskCreation } from '../task-creation/task-creation';
import { TaskInsights } from '../task-insights/task-insights';
import { ConfirmDeleteDialog } from '../../../shared/confirm-delete-dialog/confirm-delete-dialog';
import { LoaderService } from '../../../services/loader';

interface TaskGroup {
  label: string;
  tasks: Task[];
  activeFilter: string;
  filters: { name: string; count: number }[];
  filteredTasks: Task[];
}

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.html',
  styleUrls: ['./my-tasks.scss'],
  standalone: true,
  imports: [
    MatDividerModule,
    CommonModule,
    MatExpansionModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    TaskInsights
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyTasks implements OnInit, OnDestroy {

  tasks: Task[] = [];
  groupedTasks: TaskGroup[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private taskService: Tasks,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Load tasks from API */
  private loadTasks(): void {
    this.loader.show();
    this.taskService.getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: Task[]) => {
          this.tasks = [...res]; // Immutable assignment
          this.groupTasksByDate();
          this.loader.hide();
          this.cdr.markForCheck(); // trigger OnPush
        },
        error: (err) => {
          console.error('Error fetching tasks:', err);
          this.loader.hide();
          this.cdr.markForCheck();
        }
      });
  }

  /** Group tasks by date and compute filters */
  private groupTasksByDate(): void {
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();
    const tomorrowStr = new Date(now.getTime() + 86400000).toDateString();

    const validTasks = this.tasks
      .map(task => ({ ...task })) // clone to avoid mutating original
      .filter(task => {
        const dueDateTime = new Date(`${task.dueDate}T${task.dueTime || '23:59:59'}`).getTime();
        task.isOverDue = dueDateTime < now.getTime();
        return dueDateTime >= now.getTime();
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const groups: Record<string, Task[]> = {};
    validTasks.forEach(task => {
      const startStr = new Date(task.startDate).toDateString();
      const label = startStr === todayStr ? 'Today'
        : startStr === yesterdayStr ? 'Yesterday'
          : startStr === tomorrowStr ? 'Tomorrow'
            : startStr;

      if (!groups[label]) groups[label] = [];
      groups[label].push(task);
    });

    this.groupedTasks = Object.entries(groups).map(([label, tasks]) => {
      const statuses = [...new Set(tasks.map(t => t.status))];
      const priorities = [...new Set(tasks.map(t => t.priority))];
      const filters = ['All', ...statuses, ...priorities].map(f => ({
        name: f,
        count: f === 'All' ? tasks.length : tasks.filter(t => t.status === f || t.priority === f).length
      }));

      return { label, tasks, activeFilter: 'All', filters, filteredTasks: [...tasks] };
    });
  }

  /** Apply filter to a specific group */
  setFilter(group: TaskGroup, filterName: string): void {
    const updatedGroup: TaskGroup = {
      ...group,
      activeFilter: filterName,
      filteredTasks: filterName === 'All'
        ? [...group.tasks]
        : group.tasks.filter(t => t.status === filterName || t.priority === filterName)
    };

    this.groupedTasks = this.groupedTasks.map(g =>
      g.label === group.label ? updatedGroup : g
    );
  }

  /** Open task creation dialog */
  /** Open task creation dialog */
  openTaskCreation(): void {
    this.dialog.open(TaskCreation, { width: '600px' })
      .afterClosed()
      .pipe(takeUntil(this.destroy$), finalize(() => this.loader.hide()))
      .subscribe({
        next: (result) => {
          if (result) {
            this.tasks = [...this.tasks, result]; // Immutable push
            this.groupTasksByDate();
            this.cdr.markForCheck();
            this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.snackBar.open('Failed to create task', 'Close', { duration: 3000 });
          console.error('Error in task creation dialog:', err);
        }
      });
  }

  /** Open task editing dialog */
  editTask(task: Task): void {
    this.dialog.open(TaskCreation, { width: '600px', data: task })
      .afterClosed()
      .pipe(takeUntil(this.destroy$), finalize(() => this.loader.hide()))
      .subscribe({
        next: (result) => {
          if (result) {
            this.tasks = this.tasks.map(t => t.id === result.id ? result : t);
            this.groupTasksByDate();
            this.cdr.markForCheck();
            this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.snackBar.open('Failed to update task', 'Close', { duration: 3000 });
          console.error('Error in task editing dialog:', err);
        }
      });
  }

  /** Delete task */
  deleteTask(id: number | undefined): void {
    if (id === undefined) return;

    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '350px',
      data: { itemName: 'this task' }  // you can also pass the task name
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loader.show();
        this.taskService.deleteTask(String(id))
          .pipe(takeUntil(this.destroy$), finalize(() => this.loader.hide()))
          .subscribe({
            next: () => {
              this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
              this.tasks = this.tasks.filter(t => t.id !== id);
              this.groupTasksByDate();
              this.cdr.markForCheck();
            },
            error: err => {
              this.snackBar.open('Failed to delete task ❌', 'Close', { duration: 3000 });
              console.error(err);
            }
          });
      }
    });
  }

}
