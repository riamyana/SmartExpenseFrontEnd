import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { ExpensesService } from '../../services/api/expenses.service';
import { BASE_PATH, TransactionModel } from '../../services';
import { MatTableModule } from '@angular/material/table';
import { BASE_MODULE_IMPORTS } from '../../common/base_modules_imports';
import { LoaderComponent } from '../../common/loader/loader.component';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-expenses',
  imports: [...BASE_MODULE_IMPORTS, MatTableModule, LoaderComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {

  constructor(
    private expenseService: ExpensesService, 
    private http: HttpClient,
    @Inject(BASE_PATH) private basePath: string
  ) {
  }

  selectedFile: File | null = null;
  filename = '';
  file_content: Blob | any = null;
  displayedColumns: string[] = ['srNo', 'date', 'description', 'withdrawal', 'deposit', 'delete'];
  dataSource: TransactionModel[] = [];
  loading = false;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    const base_path = BASE_PATH;
    if (!this.selectedFile) return;

    // this.expenseService.uploadStatementsExpensesStatementsUploadPost(this.selectedFile as any).subscribe({
    //   next: (data) => {
    //     // this.categories = data;
    //     // console.log(this.categories);
    //   },
    //   error: (err) => console.error(err)
    // })

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.loading = true;
    
    this.http.post(`${this.basePath}/expenses/statements/upload`, formData).subscribe((data: TransactionModel[] | any) => {
      this.dataSource = data;
      console.log('data', data);
      this.loading = false;
    }, (err) => {
      console.error('failed.');
      this.loading = false;
    });
    // console.log('x', x);
  }

  // async uploadedFile(fileInputEvent: any) {
  //   try {
  //     if (fileInputEvent?.target?.files[0]) {
  //       const file = fileInputEvent.target.files[0];
  //       console.log('file', file);
  //       this.filename = file.name;
  //       const { type } = file;
  //       // this.isPDFType = type.toLowerCase() == 'pdf' || type.toLowerCase().includes('pdf');
  //       this.file_content = fileInputEvent.target.files[0];
  //     }
  //     const reader = new FileReader();
  //     reader.readAsDataURL(this.file_content);
  //     reader.onloadend = async (readerEvent: any) => {
  //       let content: string = readerEvent.target.result;
  //       content = content.replace(/^data:[a-z]+\/[a-z]+;base64,/, '');
  //       this.file_content = content;
  //       console.log('this.file_content', this.file_content);

  //       this.expenseService.uploadStatementsExpensesStatementsUploadPost(this.file_content).subscribe({
  //         next: (data) => {
  //           console.log('response', data);
  //         },
  //         error: (err) => console.error(err)
  //       })
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     // toastService.open({
  //     //   message: error,
  //     //   color: 'danger',
  //     //   duration: 4500,
  //     // });
  //   }
  // }
}
