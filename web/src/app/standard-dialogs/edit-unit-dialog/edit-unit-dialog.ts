import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'edit-unit-dialog',
  templateUrl: 'edit-unit-dialog.html',
  styleUrls: ['./edit-unit-dialog.css']
})
export class EditUnitDialog {

  constructor(
    public dialogRef: MatDialogRef<EditUnitDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  closeDlg(d): void {
    this.dialogRef.close(d);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}