import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoaderService } from '../../../common/loader/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BudgetModel, BudgetResponse, BudgetsService } from '../../../services';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmDialogData } from '../../../common/confirmation-dialog/confirmation-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-category-budget-card',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './category-budget-card.component.html',
  styleUrl: './category-budget-card.component.scss'
})
export class CategoryBudgetCardComponent {
  @Input({ required: true })
  budget!: BudgetResponse;

  @Input()
  totalAmount?: number;

  @Input()
  totalMonthly?: boolean = false;

  @Output()
  updated = new EventEmitter<void>();

  @Output()
  deleted = new EventEmitter<void>();

  isEditing = false;

  formGroup!: UntypedFormGroup;

  get editAmount(): FormControl { return this.formGroup.get('editAmount') as FormControl; }

  constructor(
    private budgetsService: BudgetsService,
    private snackBar: MatSnackBar,
    private loaderService: LoaderService,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void { 
    this.initFormGroup();
  }
  
  initFormGroup() {
    this.formGroup = this.fb.group({
      editAmount: this.fb.control(Validators.required, Validators.min(1)),
    })
  }

  budgetProgress(amount: number | undefined, total: number | undefined): number {
    if (!total || total <= 0) return 0;
    return Math.min(100, ((amount ?? 0) / total) * 100);
  }

  editBudget(): void {
    this.isEditing = true;
    this.editAmount.setValue(this.budget.amount ?? null);
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editAmount.reset();
  }

  saveEdit(): void {
    if (this.editAmount.invalid || this.editAmount.value === null) {
      return;
    }

    const request: BudgetModel = {
      id: this.budget.id,
      amount: this.editAmount.value,
      category_id: this.budget.category_id ?? null,
      month: this.budget.month ?? null,
      is_recurring: this.budget.is_recurring
    };

    this.loaderService.show();

    this.budgetsService.saveBudgetBudgetPost(request).subscribe({
      next: () => {
        this.loaderService.hide();
        this.isEditing = false;
        this.editAmount.reset();

        this.snackBar.open(
          'Budget saved successfully.',
          '',
          { duration: 3000 }
        );

        this.updated.emit();
      },
      error: (error) => {
        this.loaderService.hide();

        this.snackBar.open(
          error.error?.detail ?? 'Unable to save budget.',
          '',
          { duration: 3500 }
        );
      }
    });
  }

  deleteBudget(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Budget',
        message: `Are you sure you want to delete ${this.totalMonthly ? 'the monthly' : this.budget.category_name} budget?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.loaderService.show();

      this.budgetsService
        .deleteBudgetByIdBudgetIdDelete(this.budget.id!)
        .subscribe({
          next: () => {
            this.loaderService.hide();

            this.snackBar.open(
              'Budget deleted successfully.',
              '',
              { duration: 3000 }
            );

            this.deleted.emit();
          },
          error: () => {
            this.loaderService.hide();

            this.snackBar.open(
              'Failed to delete budget.',
              '',
              { duration: 3000 }
            );
          }
        });
    });
  }
}
