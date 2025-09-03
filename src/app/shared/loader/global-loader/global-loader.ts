import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from '../../../services/loader';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './global-loader.html',
  styleUrls: ['./global-loader.scss']
})
export class GlobalLoaderComponent {
  constructor(public loaderService: LoaderService) { }
}
