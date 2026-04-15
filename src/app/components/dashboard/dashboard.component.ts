import { Component } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';

@Component({
  selector: 'app-dashboard',
  imports: [MatSidenavModule, MatIconModule, MatListModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  menuItems = ['Dashboard', 'Expenses', 'Budgets', 'Categories'];
  activeMenu: string | null = null;
}
