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

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(UploadExpenseDialogComponent, {
      width: 'min(1180px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh'
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.loadTransactions();
      }
    });
  }
}
