import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableModule } from '@angular/material/table';
import { BASE_MODULE_IMPORTS } from '../../../common/base_modules_imports';
import { LoaderService } from '../../../common/loader/loader.service';
import { BASE_PATH, CategoriesService, CategoryModelOutput, ExpensesService, TransactionModel } from '../../../services';

@Component({
  selector: 'app-upload-expense-dialog',
  imports: [...BASE_MODULE_IMPORTS, MatButtonModule, MatDialogModule, MatFormFieldModule, MatTableModule, MatSelectModule, MatDatepickerModule],
  templateUrl: './upload-expense-dialog.component.html',
  styleUrl: './upload-expense-dialog.component.scss'
})
export class UploadExpenseDialogComponent implements OnInit {
  selectedFile: File | null = null;
  filename = '';
  draftDisplayedColumns = ['srNo', 'date', 'category', 'description', 'withdrawal', 'deposit', 'delete'];
  uploadedDraftIds = new Set<number>();
  private nextDraftId = -1;

  draftForm: FormGroup;
  manualExpenseControl: FormControl;
  categories: CategoryModelOutput[] = [];
  @ViewChild(MatTable) table!: MatTable<any>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject(BASE_PATH) private basePath: string,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UploadExpenseDialogComponent>,
    private categoriesService: CategoriesService,
    private expensesService: ExpensesService,
  ) {
    this.manualExpenseControl = new FormControl(1, [Validators.min(1)]);
    this.draftForm = this.fb.group({
      draftRows: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories(): void {
    this.categoriesService.getAllCategoryCategoryGet().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Failed to load categories.', '', { duration: 3000 });
      }
    });
  }

  get draftRows(): FormArray {
    return this.draftForm.get('draftRows') as FormArray;
  }

  private createDraftGroup(transaction?: Partial<TransactionModel>, disabled = false): FormGroup {
    return this.fb.group({
      id: [transaction?.id ?? this.nextDraftId--],
      date: [{value: transaction?.date ?? '', disabled}, Validators.required],
      category: [transaction?.category ?? '', Validators.required],
      description: [transaction?.description ?? '', Validators.required],
      withdrawal: [{value: transaction?.withdrawal ?? 0, disabled}, [Validators.min(0)]],
      deposit: [{value: transaction?.deposit ?? 0, disabled}, [Validators.min(0)]],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.filename = this.selectedFile?.name ?? '';
  }

  upload(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.loaderService.show();

    this.http.post<TransactionModel[]>(`${this.basePath}/expenses/statements/upload`, formData).subscribe({
      next: (data) => {
        this.draftRows.clear();
        this.uploadedDraftIds.clear();
        data.forEach((transaction) => {
          this.uploadedDraftIds.add(transaction.id);
          this.draftRows.push(this.createDraftGroup(transaction, false));
        });
        this.loaderService.hide();
        console.log('this.draftRows', this.draftRows);
        this.snackBar.open('Statements loaded successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
        this.table?.renderRows();
      },
      error: (error) => {
        console.error(error);
        this.loaderService.hide();
        this.snackBar.open('Failed to load statements.', '', { duration: 3000 });
      }
    });
  }

  addManualDraftRows(): void {
    const rowsToAdd = Math.max(1, Math.floor(this.manualExpenseControl.value || 1));
    for (let i = 0; i < rowsToAdd; i++) {
      this.draftRows.push(this.createDraftGroup());
    }
    this.table?.renderRows();
    this.manualExpenseControl.setValue(1);
  }

  deleteDraftRow(index: number): void {
    const row = this.draftRows.at(index).value;
    if (row) this.uploadedDraftIds.delete(row.id);
    this.draftRows.removeAt(index);
    this.table.renderRows();
  }

  get canSaveDrafts(): boolean {
    return this.draftRows.length > 0 && this.draftRows.valid && this.draftRows.controls.every(ctrl => {
      const val = ctrl.value;
      return Boolean(val.date) && Boolean((val.description || '').trim()) && ((Number(val.withdrawal) || 0) > 0 || (Number(val.deposit) || 0) > 0);
    });
  }

  isUploadedDraft(transaction: any): boolean {
    return this.uploadedDraftIds.has(transaction.id);
  }

  saveExpenses(): void {
    if (!this.canSaveDrafts) return;

    const transactions: TransactionModel[] = this.draftRows.value.map((transaction: any) => ({
      id: transaction.id,
      date: typeof transaction.date === 'string' ? transaction.date : (transaction.date as Date).toISOString().split('T')[0], // Convert to 'YYYY-MM-DD' format
      // date: (transaction.date as Date).toISOString().split('T')[0], // Convert to 'YYYY-MM-DD' format
      // date: "2026-06-01",
      category: transaction.category,
      description: transaction.description,
      withdrawal: Number(transaction.withdrawal) || 0,
      deposit: Number(transaction.deposit) || 0,
    }));

    this.loaderService.show();
    this.expensesService.saveExpensesExpensesSavePost(transactions).subscribe({
      next: () => {
        this.loaderService.hide();
        this.snackBar.open('Expenses saved successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error saving expenses:', error);
        this.loaderService.hide();
        this.snackBar.open('Failed to save expenses.', '', { duration: 3000 });
      }
    });
  }
}
