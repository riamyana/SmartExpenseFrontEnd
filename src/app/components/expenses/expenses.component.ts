import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { BASE_MODULE_IMPORTS } from '../../common/base_modules_imports';
import { LoaderService } from '../../common/loader/loader.service';
import { BASE_PATH, TransactionModel } from '../../services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UploadExpenseDialogComponent } from './upload-expense-dialog/upload-expense-dialog.component';


@Component({
  selector: 'app-expenses',
  imports: [...BASE_MODULE_IMPORTS, MatTableModule, MatDialogModule, MatButtonModule],
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
  ) {
  }

  displayedColumns: string[] = ['srNo', 'date', 'description', 'withdrawal', 'deposit'];
  transactions: TransactionModel[] = [];
  loadFailed = false;
  uploadDialogOpened = false;
  selectedYear = 'all';
  selectedMonth = 'all';
  selectedCategory = 'all';
  selectedType = 'all';
  sortOrder = 'latest';
  searchTerm = '';
  currentPage = 1;
  readonly pageSize = 10;
  readonly months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loadFailed = false;
    this.loaderService.show();

    // todo come back to this. # NotImplemented.
    this.http.get<TransactionModel[] | { data?: TransactionModel[] }>(`${this.basePath}/expenses/transactions`).subscribe({
      next: (data) => {
        this.transactions = Array.isArray(data) ? data : data.data ?? [];
        this.currentPage = 1;
        this.loaderService.hide();
        this.snackBar.open('Transactions loaded successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
      },
      error: (error) => {
        console.error('Error loading saved transactions:', error);
        this.loadFailed = true;
        this.transactions = [];
        this.loaderService.hide();
        this.snackBar.open('Failed to load transactions.', '', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }

  get availableYears(): number[] {
    return [...new Set(this.transactions.map(transaction => this.transactionDate(transaction)?.getFullYear()).filter((year): year is number => year !== undefined))].sort((a, b) => b - a);
  }

  get availableCategories(): number[] {
    return [...new Set(this.transactions.map(transaction => transaction.category).filter((category): category is number => category !== undefined))].sort((a, b) => a - b);
  }

  get filteredTransactions(): TransactionModel[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    return this.transactions.filter(transaction => {
      const date = this.transactionDate(transaction);
      const yearMatches = this.selectedYear === 'all' || date?.getFullYear() === Number(this.selectedYear);
      const monthMatches = this.selectedMonth === 'all' || date?.getMonth() === Number(this.selectedMonth);
      const categoryMatches = this.selectedCategory === 'all' || transaction.category === Number(this.selectedCategory);
      const typeMatches = this.selectedType === 'all' || (this.selectedType === 'expense' ? this.isExpense(transaction) : !this.isExpense(transaction));
      const text = `${transaction.description ?? ''} ${this.categoryLabel(transaction.category)}`.toLocaleLowerCase();
      return !!yearMatches && !!monthMatches && categoryMatches && typeMatches && (!query || text.includes(query));
    }).sort((a, b) => {
      const difference = (this.transactionDate(b)?.getTime() ?? 0) - (this.transactionDate(a)?.getTime() ?? 0);
      return this.sortOrder === 'latest' ? difference : -difference;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredTransactions.length / this.pageSize)); }
  get pagedTransactions(): TransactionModel[] { return this.filteredTransactions.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }

  setYear(value: string): void { this.selectedYear = value; this.resetPage(); }
  setMonth(value: string): void { this.selectedMonth = value; this.resetPage(); }
  setCategory(value: string): void { this.selectedCategory = value; this.resetPage(); }
  setType(value: string): void { this.selectedType = value; this.resetPage(); }
  setSort(value: string): void { this.sortOrder = value; this.resetPage(); }
  setSearch(value: string): void { this.searchTerm = value; this.resetPage(); }
  previousPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  categoryLabel(category?: number): string { return category === undefined || category === null ? 'Uncategorized' : `Category ${category}`; }
  isExpense(transaction: TransactionModel): boolean { return !!transaction.withdrawal && transaction.withdrawal > 0; }
  transactionAmount(transaction: TransactionModel): number { return this.isExpense(transaction) ? transaction.withdrawal ?? 0 : transaction.deposit ?? 0; }

  private resetPage(): void { this.currentPage = 1; }
  private transactionDate(transaction: TransactionModel): Date | undefined {
    if (!transaction.date) return undefined;
    const date = new Date(transaction.date);
    return Number.isNaN(date.getTime()) ? undefined : date;
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
