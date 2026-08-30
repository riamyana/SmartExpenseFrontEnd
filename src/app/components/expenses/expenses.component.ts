import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { BASE_MODULE_IMPORTS } from '../../common/base_modules_imports';
import { LoaderService } from '../../common/loader/loader.service';
import { BASE_PATH, CategoriesService, CategoryModelOutput, ExpenseResponse, ExpensesService, TransactionModel } from '../../services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UploadExpenseDialogComponent } from './upload-expense-dialog/upload-expense-dialog.component';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-expenses',
  imports: [...BASE_MODULE_IMPORTS, MatTableModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {

  constructor(
    private http: HttpClient,
    @Inject(BASE_PATH) private basePath: string,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private expenseService: ExpensesService,
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
  ) {
  }

  displayedColumns: string[] = ['srNo', 'date', 'description', 'withdrawal', 'deposit'];
  transactions: TransactionModel[] = [];
  loadFailed = false;
  uploadDialogOpened = false;
  fromDate = '';
  toDate = '';
  selectedCategory = 'all';
  selectedType = 'all';
  sortOrder = 'latest';
  currentPage = 1;
  readonly pageSize = 10;
  formGroup!: UntypedFormGroup;
  categories: CategoryModelOutput[] = [];

  ngOnInit(): void {
    this.initFormGroup();
    this.loadCategories();
    this.loadTransactions();
  }

  initFormGroup() {
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 3);

    this.formGroup = this.fb.group({
      fromDate: [fromDate, Validators.required],
      toDate: [new Date(), Validators.required],
      category: [""]
    });
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

  loadTransactions(): void {
    this.loadFailed = false;
    this.loaderService.show();

    // todo come back to this. # NotImplemented.
    const fromDate = new Date(this.formGroup.get('fromDate')?.value).toISOString().split('T')[0];
    const toDate = new Date(this.formGroup.get('toDate')?.value).toISOString().split('T')[0];
    const category = this.formGroup.get('category')?.value == '' ? null : this.formGroup.get('category')?.value;
    this.expenseService.getExpensesExpensesGet(1, 50, fromDate, toDate, category).subscribe({
      next: (data) => {
        this.loaderService.hide();
        this.transactions = (data as ExpenseResponse).data?.map(expense => ({
          id: expense.id ?? 0,
          date: expense.transaction_date ?? '',
          category_name: expense.category_name ?? '',
          description: expense.description ?? '',
          withdrawal: expense.withdrawal ?? 0,
          deposit: expense.deposit ?? 0
        })) ?? [];
        this.currentPage = 1;
        this.snackBar.open('Transactions loaded successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
        console.log('Loaded transactions from service:', data);
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
      }
    });
  }

  get availableCategories(): string[] {
    return [
      ...new Set(
        this.categories.map(category => category.name ?? '')
      )
    ]
    .filter(name => name !== '')
    .sort();
  }

  get filteredTransactions(): TransactionModel[] {
    return this.transactions.filter(transaction => {
      const date = this.transactionDate(transaction);
      const fromDateMatches = !this.fromDate || !!date && date >= this.dateAtStartOfDay(this.fromDate);
      const toDateMatches = !this.toDate || !!date && date <= this.dateAtEndOfDay(this.toDate);
      const categoryMatches = this.selectedCategory === 'all' || transaction.category_name === this.selectedCategory;
      const typeMatches = this.selectedType === 'all' || (this.selectedType === 'expense' ? this.isExpense(transaction) : !this.isExpense(transaction));
      return fromDateMatches && toDateMatches && categoryMatches && typeMatches;
    }).sort((a, b) => {
      const difference = (this.transactionDate(b)?.getTime() ?? 0) - (this.transactionDate(a)?.getTime() ?? 0);
      return this.sortOrder === 'latest' ? difference : -difference;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredTransactions.length / this.pageSize)); }
  get pagedTransactions(): TransactionModel[] { return this.filteredTransactions.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }

  setType(value: string): void { this.selectedType = value; this.resetPage(); }
  setSort(value: string): void { this.sortOrder = value; this.resetPage(); }
  applyFilters(): void {
    const { fromDate, toDate, category } = this.formGroup.getRawValue();
    this.fromDate = this.formatFilterDate(fromDate);
    this.toDate = this.formatFilterDate(toDate);
    this.selectedCategory = category;
    this.resetPage();
  }
  previousPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  isExpense(transaction: TransactionModel): boolean { return !!transaction.withdrawal && transaction.withdrawal > 0; }
  transactionAmount(transaction: TransactionModel): number { return this.isExpense(transaction) ? transaction.withdrawal ?? 0 : transaction.deposit ?? 0; }

  private resetPage(): void { this.currentPage = 1; }
  private transactionDate(transaction: TransactionModel): Date | undefined {
    if (!transaction.date) return undefined;
    const date = new Date(transaction.date);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  private dateAtStartOfDay(value: string): Date {
    return new Date(`${value}T00:00:00`);
  }

  private dateAtEndOfDay(value: string): Date {
    return new Date(`${value}T23:59:59.999`);
  }

  private formatFilterDate(value: Date | null): string {
    if (!value) return '';
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openUploadDialog(): void {
    this.uploadDialogOpened = false;
    try {
      const dialogRef = this.dialog.open(UploadExpenseDialogComponent, {
        width: 'min(1320px, 96vw)',
        maxWidth: '96vw',
        maxHeight: '94vh',
        hasBackdrop: false,
        panelClass: 'expense-dialog-panel'
      });
      this.uploadDialogOpened = true;
  
      dialogRef.afterClosed().subscribe((saved) => {
        this.uploadDialogOpened = false;
        if (saved) {
          this.loadTransactions();
        }
      });
    } catch (error) {
      this.uploadDialogOpened = false;
    }
  }
}
