import { Component } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [MatSidenavModule, MatIconModule, MatListModule, MatButtonModule, RouterLink, RouterLinkActive, RouterOutlet],
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
  constructor(private router: Router) {}

  goToUser(id: string) {
    this.router.navigate(['/user', id]);
  }
}
