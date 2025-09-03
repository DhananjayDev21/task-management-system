import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { GlobalLoaderComponent } from "./shared/loader/global-loader/global-loader";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule, GlobalLoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('task-management-system');
  constructor(private spinner: NgxSpinnerService) { }

  loadData() {
    this.spinner.show();

    setTimeout(() => {
      this.spinner.hide();
      alert('Data loaded!');
    }, 2000);
  }
}
