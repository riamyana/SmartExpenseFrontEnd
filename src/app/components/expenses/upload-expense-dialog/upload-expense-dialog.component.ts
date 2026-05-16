import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BASE_MODULE_IMPORTS } from '../../../common/base_modules_imports';
import { LoaderService } from '../../../common/loader/loader.service';
import { BASE_PATH, TransactionModel } from '../../../services';

@Component({
  selector: 'app-upload-expense-dialog',
  imports: [...BASE_MODULE_IMPORTS, FormsModule, MatButtonModule, MatDialogModule, MatTableModule],
  templateUrl: './upload-expense-dialog.component.html',
  styleUrl: './upload-expense-dialog.component.scss'
})
export class UploadExpenseDialogComponent {
  selectedFile: File | null = null;
  filename = '';
  manualExpenseCount = 1;
  draftDisplayedColumns = ['srNo', 'date', 'description', 'withdrawal', 'deposit', 'delete'];
  draftTransactions: TransactionModel[] = [];
  uploadedDraftIds = new Set<number>();
  private nextDraftId = -1;

  constructor(
    private http: HttpClient,
    @Inject(BASE_PATH) private basePath: string,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UploadExpenseDialogComponent>,
  ) {}

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
        const uploadedRows = data.map((transaction) => {
          this.uploadedDraftIds.add(transaction.id);
          return transaction;
        });
        this.draftTransactions = this.draftTransactions.concat(uploadedRows);
        this.loaderService.hide();
        this.snackBar.open('Statements loaded successfully.', '', { duration: 3000, panelClass: ['snackbar-success'] });
      },
      error: (error) => {
        console.error(error);
        this.loaderService.hide();
        this.snackBar.open('Failed to load statements.', '', { duration: 3000 });
      }
    });
  }

  addManualDraftRows(): void {
    const rowsToAdd = Math.max(1, Math.floor(this.manualExpenseCount || 1));
    const newRows = Array.from({ length: rowsToAdd }, () => ({
      id: this.nextDraftId--,
      date: '',
      description: '',
      withdrawal: 0,
      deposit: 0,
    }));
    this.draftTransactions = this.draftTransactions.concat(newRows);
    this.manualExpenseCount = 1;
  }

  deleteDraftRow(index: number): void {
    const row = this.draftTransactions[index];
    if (row) this.uploadedDraftIds.delete(row.id);
    this.draftTransactions = this.draftTransactions.filter((_, rowIndex) => rowIndex !== index);
  }

  get canSaveDrafts(): boolean {
    return this.draftTransactions.length > 0 && this.draftTransactions.every((transaction) =>
      Boolean(transaction.date) &&
      Boolean(transaction.description?.trim()) &&
      ((Number(transaction.withdrawal) || 0) > 0 || (Number(transaction.deposit) || 0) > 0)
    );
  }

  isUploadedDraft(transaction: TransactionModel): boolean {
    return this.uploadedDraftIds.has(transaction.id);
  }

  saveExpenses(): void {
    if (!this.canSaveDrafts) return;

    const transactions = this.draftTransactions.map((transaction) => ({
      ...transaction,
      withdrawal: Number(transaction.withdrawal) || 0,
      deposit: Number(transaction.deposit) || 0,
    }));

    this.loaderService.show();
    this.http.post(`${this.basePath}/expenses/transactions/bulk`, transactions).subscribe({
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
