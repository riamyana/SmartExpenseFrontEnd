import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { CategoryModelOutput } from '../../../services/model/categoryModelOutput';
import { BudgetModel } from '../../../services/model/budgetModel';
import { LoaderService } from '../../../common/loader/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriesService } from '../../../services';

export interface BudgetDialogData {
  categories: CategoryModelOutput[];
  month: string;
}

@Component({
  selector: 'app-budget-dialog',
  imports: [
    MatDialogModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule,
    MatInputModule, MatRadioModule, MatSelectModule, ReactiveFormsModule
  ],
  templateUrl: './budget-dialog.component.html',
  styleUrl: './budget-dialog.component.scss'
})
export class BudgetDialogComponent implements OnInit {
  form!: UntypedFormGroup;
  readonly months = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label: new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(new Date(2000, index, 1))
  }));
  categories: CategoryModelOutput[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<BudgetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BudgetDialogData,
    private snackBar: MatSnackBar,
    private loaderService: LoaderService,
    private categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.form = this.fb.group({
      type: ['category', Validators.required],
      categoryId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      month: [this.data.month, Validators.required],
      recurring: [false]
    });

    this.form.controls['type'].valueChanges.subscribe(() => this.updateCategoryValidation());
    this.form.controls['recurring'].valueChanges.subscribe((recurring: boolean) => {
      const month = this.form.controls['month'];
      recurring ? month.disable() : month.enable();
    });
  }

  get isCategoryBudget(): boolean {
    return this.form?.controls['type'].value === 'category';
  }

  get selectedMonthNumber(): string {
    return this.form?.controls['month'].value?.slice(5) ?? this.data.month.slice(5);
  }

  loadCategories(): void {
    this.loaderService.show();
    this.categoriesService.getAllCategoryCategoryGet().subscribe({
      next: (data) => {
        this.categories = data;
        this.loaderService.hide();
      },
      error: (err) => {
        this.snackBar.open('Error occurred while fetching categories.', '', { duration: 3000, panelClass: ['snackbar-error'] });
        console.error(err);
        this.loaderService.hide();
      }
    });
  }

  updateCategoryValidation(): void {
    const category = this.form.controls['categoryId'];
    if (this.isCategoryBudget) {
      category.setValidators(Validators.required);
    } else {
      category.clearValidators();
      category.setValue(null);
    }
    category.updateValueAndValidity();
  }

  selectMonth(month: string): void {
    const [year] = this.data.month.split('-');
    this.form.controls['month'].setValue(`${year}-${month}`);
  }

  save(): void {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const budget: BudgetModel = {
      amount: Number(value.amount),
      category_id: value.type === 'category' ? Number(value.categoryId) : null,
      month: value.recurring ? null : value.month
    };
    this.dialogRef.close(budget);
  }

  close(): void {
    this.dialogRef.close();
  }
}
