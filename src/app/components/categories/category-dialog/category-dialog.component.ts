import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-category-dialog',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss'
})
export class CategoryDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CategoryDialogComponent>, private fb: UntypedFormBuilder,) { }

  formGroup!: UntypedFormGroup;

  ngOnInit(): void {
    this.initFormGroup();
  }

  initFormGroup() {
    this.formGroup = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      description: this.fb.control(''),
    })
  }

  save() {
    this.dialogRef.close({
      name: this.formGroup.controls['name'].value,
      description: this.formGroup.controls['description'].value,
    });
  }

  close() {
    this.dialogRef.close();
  }
}
