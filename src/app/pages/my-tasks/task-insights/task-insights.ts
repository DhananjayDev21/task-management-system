import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { provideNativeDateAdapter } from '@angular/material/core';
import { Tasks } from '../../../services/tasks';
import { TaskAnalytics } from '../task-analytics/task-analytics';

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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatChipsModule,
    MatDividerModule,
    FormsModule,
    TaskAnalytics
  ],
  templateUrl: './task-insights.html',
  styleUrl: './task-insights.scss',
  providers: [provideNativeDateAdapter()],
})
export class TaskInsights implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;

  public donutChartOptions: Partial<ChartOptions> = {};
  selectedDate = new FormControl(new Date());

  tasks: any[] = [];
  statuses = ['pending', 'in-progress', 'completed', 'on-hold'];

  startDate: any;
  endDate: any;
  isDefaultFilter: boolean = false;

  constructor(private taskService: Tasks) { }

  ngOnInit() {
    // Set default last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    this.startDate = sevenDaysAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];

    this.getTasks();
  }


  getTasks() {
    this.taskService.getTasks().subscribe({
      next: (res: any[]) => {
        this.tasks = res;

        // Show default last 7 days chart
        if (this.startDate && this.endDate) {
          this.updateChartForDateRange(this.startDate, this.endDate);
        }

      },
      error: (err: any) => {
        console.error('Error fetching tasks:', err);
      }
    });
  }

  // Filter tasks by date range and rebuild chart
  updateChartForDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredTasks = this.tasks.filter(task => {
      const taskDate = new Date(task.startDate);
      return taskDate >= start && taskDate <= end;
    });


    // Determine if default filter (last 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const start1 = new Date(this.startDate);
    start.setHours(0, 0, 0, 0);
    const end1 = new Date(this.endDate);
    end.setHours(0, 0, 0, 0);

    // Check if default last-7-days filter is applied
    this.isDefaultFilter =
      start.getTime() === sevenDaysAgo.getTime() &&
      end.getTime() === today.getTime();


    this.buildChartData(filteredTasks);
  }

  // Build chart from tasks array
  buildChartData(tasksParam?: any[]) {

    const tasksToUse = tasksParam || this.tasks;

    const statusCounts: any = {
      'pending': 0,
      'in-progress': 0,
      'completed': 0,
      'on-hold': 0
    };

    for (const task of tasksToUse) {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    }

    const labels = this.statuses;
    const series = labels.map(status => statusCounts[status]);



    // If chart already exists, update series
    if (this.chart) {
      this.chart.updateSeries(series);
    } else {
      // First-time initialization
      this.donutChartOptions = {
        series,
        chart: { type: 'donut', height: 280 },
        labels,
        title: { text: 'Tasks by Status' },
        responsive: [
          {
            breakpoint: 480,
            options: { chart: { width: 300 }, legend: { position: 'bottom' } }
          }
        ],
        legend: { position: 'right', offsetY: 0 },
        dataLabels: { enabled: true },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total Tasks',
                  formatter: (w) => w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0).toString()
                }
              }
            }
          }
        }
      };
    }
  }


  // Apply selected date range
  applyRange() {
    if (this.startDate && this.endDate) {
      this.updateChartForDateRange(this.startDate, this.endDate);
    } else {
      alert('Please select both start and end dates!');
    }
  }

  // Reset to default last 7 days
  resetRange() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.startDate = sevenDaysAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];

    this.updateChartForDateRange(this.startDate, this.endDate);
  }

}