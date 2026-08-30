import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoaderService } from '../../common/loader/loader.service';
import { BudgetsService } from '../../services/api/budgets.service';
import { BudgetModel } from '../../services/model/budgetModel';
import { CategoryModelOutput } from '../../services/model/categoryModelOutput';
import { BudgetDialogComponent } from './budget-dialog/budget-dialog.component';
import { BudgetResponse } from '../../services';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-budgets',
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatCardModule, 
    MatDialogModule, 
    MatIconModule, 
    MatProgressBarModule, 
    MatSnackBarModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss'
})
export class BudgetsComponent implements OnInit {
  selectedMonth = this.monthKey(new Date());
  readonly months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(new Date().getFullYear(), index, 1);

    return {
      value: `${date.getFullYear()}-${String(index + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('en-IN', {
        month: 'long',
        year: 'numeric'
      }).format(date)
    };
  });

  monthlyBudgets: BudgetResponse[] = [];
  recurringBudgets: BudgetResponse[] = [];
  categories: CategoryModelOutput[] = [];
  editingBudgetId: number | null = null;
  // editAmount = new FormControl<number | null>(null, [
  //   Validators.required,
  //   Validators.min(1)
  // ]);
  // monthControl = new FormControl(this.selectedMonth);
  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;
  formGroup!: UntypedFormGroup;

  constructor(
    private budgetsService: BudgetsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private loaderService: LoaderService,
    private fb: UntypedFormBuilder,
  ) {}

  ngOnInit(): void { 
    this.initFormGroup();
    this.applySubcription();
    this.loadBudgets();
  }

  get editAmount(): FormControl { return this.formGroup.get('editAmount') as FormControl; }
  get monthControl(): FormControl { return this.formGroup.get('monthControl') as FormControl; }

  initFormGroup() {
    this.formGroup = this.fb.group({
      editAmount: this.fb.control(Validators.required, Validators.min(1)),
      monthControl: this.fb.control(this.selectedMonth),
    })
  }

  applySubcription() {
    this.monthControl.valueChanges.subscribe(month => {
      if (!month) return;

      this.selectedMonth = month;
      this.loadBudgets();
    });
  }

  get monthLabel(): string {
    const [year, month] = this.selectedMonth.split('-').map(Number);
    return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1));
  }

  get monthlyBudget(): BudgetResponse | undefined { return this.monthlyBudgets.find(budget => budget.category_id == null); }
  get monthlyCategoricalBudgets(): BudgetResponse[] { return this.monthlyBudgets.filter(budget => budget.category_id != null); }
  get recurringMonthlyBudget(): BudgetResponse | undefined { return this.recurringBudgets.find(budget => budget.month == null && budget.category_id == null); }
  get recurringCategoricalBudgets(): BudgetResponse[] { return this.recurringBudgets.filter(budget => budget.month == null && budget.category_id != null); }

  budgetProgress(amount: number | undefined, total: number | undefined): number {
    if (!total || total <= 0) return 0;
    return Math.min(100, ((amount ?? 0) / total) * 100);
  }

  changeMonth(offset: number): void {
    const [year, month] = this.selectedMonth.split('-').map(Number);
    const newMonth = this.monthKey(
      new Date(year, month - 1 + offset, 1)
    );

    this.selectedMonth = newMonth;
    this.monthControl.setValue(newMonth);
  }

  selectMonth(month: string): void {
    this.selectedMonth = month;
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.loaderService.show();
    this.budgetsService.getBudgetByMonthBudgetMonthlyMonthGet(this.selectedMonth).subscribe({
      next: (monthly) => {
        console.log('Monthly Budgets:', monthly);
        this.monthlyBudgets = monthly.filter((budget) => budget.month != null);
        this.recurringBudgets = monthly.filter((budget) => budget.month == null);
        this.loaderService.hide();
      },
      error: error => {
        console.error(error);
        this.loaderService.hide();
        this.snackBar.open('Unable to load budgets. Please try again.', '', { duration: 3500 });
      }
    });
  }

  openAddBudget(): void {
    const dialogRef = this.dialog.open(BudgetDialogComponent, {
      width: '520px', data: { categories: this.categories, month: this.selectedMonth }
    });
    dialogRef.afterClosed().subscribe((budget?: BudgetModel) => {
      if (!budget) return;
      this.loaderService.show();
      this.budgetsService.saveBudgetBudgetPost(budget).subscribe({
        next: () => {
          this.snackBar.open('Budget saved successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
          this.loadBudgets();
        },
        error: error => {
          console.error(error);
          this.loaderService.hide();
          this.snackBar.open('Unable to save budget. Please try again.', '', { duration: 3500 });
        }
      });
    });
  }

  formatAmount(amount?: number): string { 
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount ?? 0); 
  }

  private monthKey(date: Date): string {
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
  }

  confirmDelete(budget: BudgetResponse): void {
    const dialogRef = this.dialog.open(this.deleteDialog, {
      data: budget
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.loaderService.show();
      this.budgetsService.deleteBudgetByIdBudgetIdDelete(budget.id!).subscribe({
        next: () => {
          this.snackBar.open('Budget deleted successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
          this.loadBudgets();
          this.loaderService.hide();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to delete budget.', '', { duration: 3000, panelClass: ['snackbar-error'] });
          this.loaderService.hide();
        }
      });
    });
  }

  editBudget(budget: BudgetModel): void {
    this.editingBudgetId = budget.id ?? null;
    this.editAmount.setValue(budget.amount ?? null);
  }

  cancelEdit(): void {
    this.editingBudgetId = null;
    this.editAmount.reset();
  }

  saveEdit(budget: BudgetResponse): void {
    const budgetRequest: BudgetModel = {
      amount: this.editAmount.value ?? 0,
      category_id: budget.category_id ?? null,
      month: budget.month ?? null,
      is_recurring: budget.is_recurring
    };

    this.loaderService.show();
    this.budgetsService.saveBudgetBudgetPost(budgetRequest).subscribe({
      next: () => {
        this.loaderService.hide();
        this.snackBar.open('Budget saved successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
        this.loadBudgets();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.loaderService.hide();
        this.snackBar.open(error.error?.detail ?? 'Unable to save budget. Please try again.', '', { duration: 3500, panelClass: ['snackbar-error'] });
      }
    });

    this.editingBudgetId = null;
    this.editAmount.reset();
  }
}
