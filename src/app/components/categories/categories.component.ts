import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CategoriesService } from '../../services/api/categories.service';
import { CategoryModel } from '../../services/model/categoryModel';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';

@Component({
  selector: 'app-categories',
  imports: [MatCardModule, MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {

  constructor(private categoriesService: CategoriesService, private dialog: MatDialog) {
  }

  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

  categories: CategoryModel[] = [];

  async ngOnInit(): Promise<void> {
    await this.categoriesService.getAllCategoryCategoryGet().subscribe({
      next: (data) => {
        this.categories = data;
        console.log(this.categories);
      },
      error: (err) => console.error(err)
    })
  }

  addCategory() {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User data:', result);
        // 👉 call API here
      }
    });
  }

  confirmDelete(category: CategoryModel) {
    const dialogRef = this.dialog.open(this.deleteDialog, {
      data: category
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Delete confirmed', category);

        // 👉 call delete API here
        // this.categoryService.delete(category.id)
      }
    });
  }

  editCategory() {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User data:', result);
        // 👉 call API here
      }
    });
  }
}
