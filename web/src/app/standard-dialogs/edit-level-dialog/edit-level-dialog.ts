import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditEntity } from '../edit-entity';

@Component({
  selector: 'app-edit-level-dialog',
  templateUrl: './edit-level-dialog.html',
  styleUrls: ['./edit-level-dialog.css']
})
export class EditLevelDialog extends EditEntity implements OnInit {

  constructor(
    private ref: MatDialogRef<EditLevelDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    super(data.entity, data.autoPublish, ref);
  }

  ngOnInit() {
  }
}
