import { Component } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [MatSidenavModule, MatIconModule, MatListModule, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  menuItems = [
    {
      name: 'Dashboard', link: '',
    
    }, 
    {
      name: 'Expenses', link: 'expenses',
    
    }, 
    {
      name: 'Budgets', link: 'budgets',
    
    }, 
    {
      name: 'Categories', link: 'categories',
    }
  ];
  activeMenu: string | null = null;

  constructor(private router: Router) {}

  goToUser(id: string) {
    this.router.navigate(['/user', id]);
  }

  onMenuClicked(menu: any) {
    this.activeMenu = menu.name;

    if (this.activeMenu === 'Expenses') {
      this.router.navigate([menu.link]);
    }
  }
}
