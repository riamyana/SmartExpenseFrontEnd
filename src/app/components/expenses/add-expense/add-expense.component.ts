import { Component, OnInit } from '@angular/core';
import { BASE_MODULE_IMPORTS } from '../../../common/base_modules_imports';
import { FormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { TransactionModel } from '../../../services';

@Component({
  selector: 'app-add-expense',
  imports: [...BASE_MODULE_IMPORTS, MatIconModule, MatButtonModule, MatDatepickerModule, MatDialogModule],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss'
})
export class AddExpenseComponent implements OnInit{

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<AddExpenseComponent>) {}
  
  formGroup!: UntypedFormGroup;
  numberOfExpenses: number = 1;
  expenses: TransactionModel[] = [];
  
  ngOnInit(): void {
    this.initFormGroup();
  }

  initFormGroup() {
    this.formGroup = this.fb.group({
      numberOfExpenses: this.fb.control(1, [Validators.required, Validators.min(1)]),
      expenses: this.fb.array([])
    });
    this.addExpenseForm();
  }

  get expensesArray(): FormArray {
    return this.formGroup.get('expenses') as FormArray;
  }

  createExpenseForm(): UntypedFormGroup {
    return this.fb.group({
      date: this.fb.control('', Validators.required),
      description: this.fb.control('', Validators.required),
      withdrawal: this.fb.control('', [Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
      deposit: this.fb.control('', [Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
    });
  }

  addExpenseForm(): void {
    this.expensesArray.push(this.createExpenseForm());
  }

  removeExpenseForm(index: number): void {
    if (this.expensesArray.length > 1) {
      this.expensesArray.removeAt(index);
      this.formGroup.get('numberOfExpenses')?.setValue(this.expensesArray.length);
    }
  }

  onNumberOfExpensesChange(num: string | number): void {
    const numValue = typeof num === 'string' ? parseInt(num, 10) : num;
    const currentLength = this.expensesArray.length;
    
    if (numValue > currentLength) {
      for (let i = currentLength; i < numValue; i++) {
        this.addExpenseForm();
      }
    } else if (numValue < currentLength) {
      for (let i = currentLength - 1; i >= numValue; i--) {
        this.removeExpenseForm(i);
      }
    }
  }

  confirm(): void {
    if (this.formGroup.valid) {
      this.expensesArray.controls.forEach(control => {
        const expense: TransactionModel = {
          id: 0,
          date: control.get('date')?.value.toISOString().split('T')[0], // Format date as YYYY-MM-DD
          description: control.get('description')?.value,
          withdrawal: parseFloat(control.get('withdrawal')?.value) || 0,
          deposit: parseFloat(control.get('deposit')?.value) || 0,
        }
        this.expenses.push(expense);
      });
      this.dialogRef.close(this.expenses);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (this.formGroup.valid) {
      this.expenses = [];
      this.expensesArray.controls.forEach(control => {
        const expense: TransactionModel = {
          id: 0,
          date: control.get('date')?.value.toISOString().split('T')[0],
          description: control.get('description')?.value,
          withdrawal: parseFloat(control.get('withdrawal')?.value) || 0,
          deposit: parseFloat(control.get('deposit')?.value) || 0,
        }
        this.expenses.push(expense);
      });
      this.dialogRef.close({ data: this.expenses, action: 'save' });
    }
  }
}
