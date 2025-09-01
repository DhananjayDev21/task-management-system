import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from '../topbar/topbar';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, Topbar, Sidebar],
  templateUrl: './shell.html',
  styleUrls: ['./shell.scss']   // ✅ should be plural
})
export class Shell {

  isSidebarCollapsed = false; // desktop state
  isSidebarOpen = false;      // mobile state

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.isSidebarOpen = !this.isSidebarOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
