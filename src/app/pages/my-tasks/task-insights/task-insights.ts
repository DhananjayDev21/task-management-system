import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexPlotOptions
} from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { Tasks } from '../../../services/tasks';
import { TaskAnalytics } from '../task-analytics/task-analytics';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task } from '../../../models/model';
import { LoaderService } from '../../../services/loader';


export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-task-insights',
  standalone: true,
  imports: [
    NgApexchartsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatChipsModule,
    MatDividerModule,
    TaskAnalytics
  ],
  templateUrl: './task-insights.html',
  styleUrls: ['./task-insights.scss'],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },           // ✅ UK locale → dd/MM/yyyy
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskInsights implements OnInit, OnDestroy {
  @ViewChild('chart') chart!: ChartComponent;

  public donutChartOptions: Partial<ChartOptions> = {};
  selectedDate = new FormControl(new Date());

  tasks: Task[] = [];
  statuses: Task['status'][] = ['pending', 'in-progress', 'completed', 'on-hold'];

  startDate!: string;
  endDate!: string;
  isDefaultFilter = false;

  private destroy$ = new Subject<void>();

  constructor(private taskService: Tasks) { }

  ngOnInit(): void {
    this.setDefaultRange();
    this.getTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setDefaultRange(): void {
    const { start, end } = this.getLast7Days();
    this.startDate = start;
    this.endDate = end;
  }

  getLast7Days(): { start: string; end: string } {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    return {
      start: sevenDaysAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };
  }

  getTasks(): void {
    this.taskService.getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: Task[]) => {
          this.tasks = res;
          this.updateChartForDateRange(this.startDate, this.endDate);
        },
        error: (err) => console.error('Error fetching tasks:', err),
      });
  }

  updateChartForDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredTasks = this.tasks.filter(task => {
      const taskDate = new Date(task.startDate);
      return taskDate >= start && taskDate <= end;
    });

    const { start: defaultStart, end: defaultEnd } = this.getLast7Days();
    this.isDefaultFilter = startDate === defaultStart && endDate === defaultEnd;

    this.buildChartData(filteredTasks);
  }

  buildChartData(tasksParam: Task[] = this.tasks): void {
    const statusCounts: Record<Task['status'], number> = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      'on-hold': 0,
    };

    for (const task of tasksParam) {
      statusCounts[task.status]++;
    }

    const labels = this.statuses;
    const series = labels.map(status => statusCounts[status]);

    if (this.chart) {
      this.chart.updateSeries(series);
    } else {
      this.donutChartOptions = {
        series,
        chart: { type: 'donut', height: 280 },
        labels,
        title: { text: 'Tasks by Status' },
        responsive: [
          {
            breakpoint: 480,
            options: { chart: { width: 300 }, legend: { position: 'bottom' } },
          },
        ],
        legend: { position: 'right' },
        dataLabels: { enabled: true },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total Tasks',
                  formatter: (w) =>
                    w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString(),
                },
              },
            },
          },
        },
      };
    }
  }

  applyRange(): void {
    if (this.startDate && this.endDate) {
      this.updateChartForDateRange(this.startDate, this.endDate);
    }
  }

  resetRange(): void {
    this.setDefaultRange();
    this.updateChartForDateRange(this.startDate, this.endDate);
  }
}
