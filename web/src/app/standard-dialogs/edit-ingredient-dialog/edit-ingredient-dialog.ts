import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Cache } from "../../shared/cache/cache";
import { EditEntity } from '../edit-entity';

@Component({
  selector: 'app-edit-ingredient-dialog',
  templateUrl: './edit-ingredient-dialog.html',
  styleUrls: ['./edit-ingredient-dialog.css']
})
export class EditIngredientDialog extends EditEntity implements OnInit {

  constructor(
    private ref: MatDialogRef<EditIngredientDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cache: Cache) {
      super(data.entity, data.autoPublish, ref);
     }

  ngOnInit() {
  }
}
