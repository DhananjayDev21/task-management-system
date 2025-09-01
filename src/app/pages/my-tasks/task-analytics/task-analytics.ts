import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { Tasks } from '../../../services/tasks';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../models/model';

@Component({
  selector: 'app-task-analytics',
  imports: [FormsModule, CommonModule],
  templateUrl: './task-analytics.html',
  styleUrl: './task-analytics.scss'
})
export class TaskAnalytics {


  constructor(private taksService: Tasks, private cdr: ChangeDetectorRef) { }

  tasks: Task[] = []

  filters: any = {
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

  filteredData: Task[] = [];
  isDefaultFilter: boolean = true;
  hasUnappliedChanges: boolean = false;

  statusOptions: string[] = [];
  priorityOptions: string[] = [];
  categoryOptions: string[] = [];
  activeFilterCount = 0;

  ngOnInit() {
    this.getTasks();
  }

  getTasks() {
    this.taksService.getTasks().subscribe({
      next: (res: any[]) => {
        this.tasks = res;
        this.tasks = res.map(t => {
          const due = new Date(t.dueDate);
          const isFinished = t.status === 'completed';      // adjust if needed
          return { ...t, isOverDue: !isFinished && due < new Date() };
        });

        this.extractFilterOptions();
        this.setDefaultLast7Days();
        this.applyFilters();
      },
      error: (err: any) => {
        console.error('Error fetching tasks:', err);
      }
    });
  }

  setDefaultLast7Days() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    this.filters.startDateFrom = sevenDaysAgo.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    this.filters.endDateTo = today.toLocaleDateString('en-CA');
    this.updateActiveFilterCount();

  }


  extractFilterOptions() {
    this.statusOptions = [...new Set(this.tasks.map(t => t.status))];
    this.priorityOptions = [...new Set(this.tasks.map(t => t.priority))];
    this.categoryOptions = [...new Set(this.tasks.map(t => t.category))];
  }

  onFilterChange() {
    this.hasUnappliedChanges = true;
  }

  applyFilters() {
    this.filteredData = this.tasks.filter(task => {
      const startDate = new Date(task.startDate);
      const fromDate = new Date(this.filters.startDateFrom);
      const toDate = new Date(this.filters.endDateTo);
      const matchesDate = startDate >= fromDate && startDate <= toDate;

      const matchesStatus = !this.filters.status || task.status === this.filters.status;
      const matchesPriority = !this.filters.priority || task.priority === this.filters.priority;
      const matchesCategory = !this.filters.category || task.category === this.filters.category;
      const matchesText = !this.filters.searchText ||
        task.title.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(this.filters.searchText.toLowerCase());
      const matchesOverdue = !this.filters.overdueOnly || task.isOverDue;


      return matchesDate && matchesStatus && matchesPriority && matchesCategory && matchesText && matchesOverdue;
    });


    this.hasUnappliedChanges = false;

    // Determine if default filter (last 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const start = new Date(this.filters.startDateFrom);
    start.setHours(0, 0, 0, 0);
    const end = new Date(this.filters.endDateTo);
    end.setHours(0, 0, 0, 0);

    // Check if default last-7-days filter is applied
    this.isDefaultFilter =
      start.getTime() === sevenDaysAgo.getTime() &&
      end.getTime() === today.getTime();

    this.getCounts();
    this.cdr.detectChanges();

  }

  counts: any = {};


  getCounts() {
    const newCounts: any = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      'on-hold': 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0
    };

    this.filteredData.forEach((task: any) => {
      newCounts[task.status] = (newCounts[task.status] || 0) + 1;
      newCounts[task.priority] = (newCounts[task.priority] || 0) + 1;
      newCounts.total++;
    });

    this.counts = newCounts; // 🔑 assign new object (triggers UI update)
  }



  showAllData() {
    this.filters = { searchText: '', status: '', priority: '', category: '', createdBy: [], tags: [], startDateFrom: '', endDateTo: '' };
    this.setDefaultLast7Days();
    this.applyFilters();
  }

  resetToDefault() {
    this.setDefaultLast7Days();
    this.applyFilters();
  }

  getTasksByStatus(status: string) {
    return this.filteredData.filter(t => t.status === status);
  }

  updateActiveFilterCount() {
    let count = 0;
    if (this.filters.searchText) count++;
    if (this.filters.status) count++;
    if (this.filters.priority) count++;
    if (this.filters.category) count++;
    if (this.filters.startDateFrom || this.filters.endDateTo) count++;
    this.activeFilterCount = count;
  }


  trackByTaskId(index: number, task: Task): any {
    return task.id;
  }

  clearAllFilters() {
    this.showAllData();  // just calls showAllData to reset all filters
  }

}
