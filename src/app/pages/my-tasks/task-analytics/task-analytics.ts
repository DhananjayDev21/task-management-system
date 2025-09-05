import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Task } from '../../../models/model';
import { Tasks } from '../../../services/tasks';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

interface TaskFilters {
  searchText: string;
  status: string;
  priority: string;
  category: string;
  createdBy: string[];
  tags: string[];
  startDateFrom: string;
  endDateTo: string;
  overdueOnly: boolean;
}

interface TaskCounts {
  pending: number;
  'in-progress': number;
  completed: number;
  'on-hold': number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

@Component({
  selector: 'app-task-analytics',
  standalone: true,
  imports: [
    FormsModule,           // For template-driven forms
    ReactiveFormsModule,   // For reactive forms - ADD THIS
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './task-analytics.html',
  styleUrl: './task-analytics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },           // ✅ UK locale → dd/MM/yyyy
  ],
})
export class TaskAnalytics implements OnInit {

  tasks: Task[] = [];
  filteredData: Task[] = [];
  counts: TaskCounts = this.initCounts();

  filters: TaskFilters = this.initFilters();
  isDefaultFilter = true;
  hasUnappliedChanges = false;
  activeFilterCount = 0;

  statusOptions: string[] = [];
  priorityOptions: string[] = [];
  categoryOptions: string[] = [];

  constructor(private taskService: Tasks, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.getTasks();
  }

  private initFilters(): TaskFilters {
    return {
      searchText: '',
      status: '',
      priority: '',
      category: '',
      createdBy: [],
      tags: [],
      startDateFrom: '',
      endDateTo: '',
      overdueOnly: false
    };
  }

  private initCounts(): TaskCounts {
    return {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      'on-hold': 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0
    };
  }

  private getTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (res: Task[]) => {
        const now = new Date();
        this.tasks = res.map(task => {
          const due = new Date(task.dueDate);
          const isFinished = task.status === 'completed';
          return { ...task, isOverDue: !isFinished && due < now };
        });

        this.extractFilterOptions();
        this.resetToDefault();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error fetching tasks:', err)
    });
  }

  private extractFilterOptions(): void {
    this.statusOptions = [...new Set(this.tasks.map(t => t.status))];
    this.priorityOptions = [...new Set(this.tasks.map(t => t.priority))];
    this.categoryOptions = [...new Set(this.tasks.map(t => t.category))];
  }

  onFilterChange(): void {
    this.hasUnappliedChanges = true;
    this.cdr.markForCheck();
  }

  applyFilters(): void {
    const { searchText, status, priority, category, startDateFrom, endDateTo, overdueOnly } = this.filters;

    const fromDate = new Date(startDateFrom);
    const toDate = new Date(endDateTo);

    this.filteredData = this.tasks.filter(task => {
      const start = new Date(task.startDate);
      const matchesDate = start >= fromDate && start <= toDate;
      const matchesStatus = !status || task.status === status;
      const matchesPriority = !priority || task.priority === priority;
      const matchesCategory = !category || task.category === category;
      const matchesText = !searchText ||
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesOverdue = !overdueOnly || task.isOverDue;

      return matchesDate && matchesStatus && matchesPriority && matchesCategory && matchesText && matchesOverdue;
    });

    this.hasUnappliedChanges = false;
    this.updateDefaultFilterFlag();
    this.updateCounts();
    this.updateActiveFilterCount();
    this.cdr.markForCheck();
  }

  private updateDefaultFilterFlag(): void {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 6);

    const start = new Date(this.filters.startDateFrom); start.setHours(0, 0, 0, 0);
    const end = new Date(this.filters.endDateTo); end.setHours(0, 0, 0, 0);

    this.isDefaultFilter =
      start.getTime() === sevenDaysAgo.getTime() &&
      end.getTime() === today.getTime();
  }

  private updateCounts(): void {
    const newCounts = this.initCounts();
    this.filteredData.forEach(task => {
      newCounts[task.status as keyof TaskCounts] = (newCounts[task.status as keyof TaskCounts] || 0) + 1;
      newCounts[task.priority as keyof TaskCounts] = (newCounts[task.priority as keyof TaskCounts] || 0) + 1;
      newCounts.total++;
    });
    this.counts = newCounts;
  }

  private updateActiveFilterCount(): void {
    const { searchText, status, priority, category, startDateFrom, endDateTo } = this.filters;
    let count = 0;
    if (searchText) count++;
    if (status) count++;
    if (priority) count++;
    if (category) count++;
    if (startDateFrom || endDateTo) count++;
    this.activeFilterCount = count;
  }

  resetToDefault(): void {
    const today = new Date();
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(today.getDate() - 6);

    this.filters.startDateFrom = sevenDaysAgo.toISOString().split('T')[0];
    this.filters.endDateTo = today.toISOString().split('T')[0];

    console.log(this.filters.startDateFrom + ' ' + this.filters.endDateTo);


    this.applyFilters();
  }

  clearAllFilters(): void {
    this.filters = this.initFilters();
    this.resetToDefault();
  }

  getTasksByStatus(status: string): Task[] {
    return this.filteredData.filter(t => t.status === status);
  }

  trackByTaskId(index: number, task: Task): number | undefined {
    return task.id;
  }
}
