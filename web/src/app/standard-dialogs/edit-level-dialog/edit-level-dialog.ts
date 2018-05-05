import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-edit-level-dialog',
  templateUrl: './edit-level-dialog.html',
  styleUrls: ['./edit-level-dialog.css']
})
export class EditLevelDialog implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditLevelDialog>,
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
