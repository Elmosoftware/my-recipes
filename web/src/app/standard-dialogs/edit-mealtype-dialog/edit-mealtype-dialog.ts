import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditEntity } from '../edit-entity';

@Component({
  selector: 'app-edit-mealtype-dialog',
  templateUrl: './edit-mealtype-dialog.html',
  styleUrls: ['./edit-mealtype-dialog.css']
})
export class EditMealTypeDialog extends EditEntity implements OnInit {

  constructor(
    private ref: MatDialogRef<EditMealTypeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    super(data.entity, data.autoPublish, ref);
  }

  ngOnInit() {
  }
}
