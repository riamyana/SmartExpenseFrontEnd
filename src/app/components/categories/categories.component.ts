import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoriesService } from '../../services/api/categories.service';
import { CategoryModel } from '../../services/model/categoryModel';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';

@Component({
  selector: 'app-categories',
  imports: [MatCardModule, MatDialogModule, MatButtonModule, MatSnackBarModule, CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {

  constructor(private categoriesService: CategoriesService, private dialog: MatDialog) {
  }

  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

  categories: CategoryModel[] = [];

  ngOnInit(): void {
    this.categoriesService.getAllCategoryCategoryGet().subscribe({
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

    dialogRef.afterClosed().subscribe((category: CategoryModel) => {
      if (category) {
        const addRequest: CategoryModel = {
          name: category.name,
          description: category.description
        }
        this.categoriesService.addCategoryCategoryPost(addRequest).subscribe({
          next: (data) => {
            // snackBar.open('Message archived', 'Undo', {
            //   duration: 3000
            // });
            console.log(data);
          },
          error: (err) => console.error(err)
        })
        console.log('User data:', category);
      }
    });
  }

  confirmDelete(category: CategoryModel) {
    const dialogRef = this.dialog.open(this.deleteDialog, {
      data: category
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.categoriesService.deleteCategoryByIdCategoryIdDelete(category.id!).subscribe({
          next: (data) => {
            console.log('Delete confirmed: ', data);
          },
          error: (err) => {
            console.error(err);
          }
        })
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
