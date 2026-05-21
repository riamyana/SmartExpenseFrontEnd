import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoriesService } from '../../services/api/categories.service';
import { CategoryModel } from '../../services/model/categoryModel';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { CategoryModelOutput } from '../../services';
import { LoaderService } from '../../common/loader/loader.service';

@Component({
  selector: 'app-categories',
  imports: [MatCardModule, MatDialogModule, MatButtonModule, MatSnackBarModule, CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

  categories: CategoryModelOutput[] = [];

  constructor(
    private categoriesService: CategoriesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private loaderService: LoaderService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loaderService.show();
    this.categoriesService.getAllCategoryCategoryGet().subscribe({
      next: (data) => {
        this.categories = data;
        this.loaderService.hide();
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
      }
    });
  }

  get systemCategories(): CategoryModelOutput[] {
    return this.categories.filter(category => this.isSystemCategory(category));
  }

  get customCategories(): CategoryModelOutput[] {
    return this.categories.filter(category => !this.isSystemCategory(category));
  }

  isSystemCategory(category: CategoryModelOutput): boolean {
    return Boolean(category.isSystem);
  }

  addCategory(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '460px'
    });

    dialogRef.afterClosed().subscribe((category: CategoryModel) => {
      if (!category) return;

      const addRequest: CategoryModel = {
        name: category.name,
        description: category.description
      };

      this.loaderService.show();
      this.categoriesService.addCategoryCategoryPost(addRequest).subscribe({
        next: () => {
          this.snackBar.open('Category added successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
          this.loadCategories();
          this.loaderService.hide();
        },
        error: (err) => {
          console.error(err);
          this.loaderService.hide();
        }
      });
    });
  }

  editCategory(category: CategoryModelOutput): void {
    if (this.isSystemCategory(category)) return;

    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '460px',
      data: category
    });

    dialogRef.afterClosed().subscribe((result: CategoryModel) => {
      if (!result) return;

      const updateRequest: CategoryModel = {
        name: result.name,
        description: result.description
      };

      this.loaderService.show();
      this.categoriesService.updateCategoryByIdCategoryIdPut(category.id!, updateRequest).subscribe({
        next: () => {
          this.snackBar.open('Category updated successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
          this.loadCategories();
          this.loaderService.hide();
        },
        error: (err) => {
          console.error(err);
          this.loaderService.hide();
        }
      });
    });
  }

  confirmDelete(category: CategoryModelOutput): void {
    if (this.isSystemCategory(category)) return;

    const dialogRef = this.dialog.open(this.deleteDialog, {
      data: category
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.loaderService.show();
      this.categoriesService.deleteCategoryByIdCategoryIdDelete(category.id!).subscribe({
        next: () => {
          this.snackBar.open('Category deleted successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
          this.loadCategories();
          this.loaderService.hide();
        },
        error: (err) => {
          console.error(err);
          this.loaderService.hide();
        }
      });
    });
  }
}
