import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-edit-mealtype-dialog',
  templateUrl: './edit-mealtype-dialog.html',
  styleUrls: ['./edit-mealtype-dialog.css']
})
export class EditMealTypeDialog implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditMealTypeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  closeDlg(d): void {
    this.dialogRef.close(d);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
