import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-edit-recipe-direction-dialog',
  templateUrl: './edit-recipe-direction-dialog.html',
  styleUrls: ['./edit-recipe-direction-dialog.css']
})
export class EditRecipeDirectionDialog implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditRecipeDirectionDialog>,
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
