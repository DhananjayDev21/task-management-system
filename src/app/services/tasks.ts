import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/model';

@Injectable({
  providedIn: 'root'
})
export class Tasks {
  private baseUrl = 'https://json-server-avsh.onrender.com/tasks';  // JSON Server endpoint

  constructor(private http: HttpClient) { }

  /** Create a new Task */
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task);
  }

  /** Get all Tasks */
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  /** Get single Task by id */
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  /** Update Task */
  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, task);
  }

  /** Delete Task */
  deleteTask(id: any): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
