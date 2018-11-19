import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditEntity } from '../edit-entity';

@Component({
  selector: 'edit-unit-dialog',
  templateUrl: 'edit-unit-dialog.html',
  styleUrls: ['./edit-unit-dialog.css']
})
export class EditUnitDialog extends EditEntity {

  constructor(
    private ref: MatDialogRef<EditUnitDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    super(data.entity, data.autoPublish, ref);
  }
}
