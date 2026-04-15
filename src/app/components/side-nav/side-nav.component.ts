import { Component } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-side-nav',
  imports: [MatSidenavModule, MatIconModule, MatListModule, RouterOutlet],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent {
  menuItems = ['Dashboard', 'Expenses', 'Budgets', 'Categories'];
  activeMenu: string | null = null;
}
