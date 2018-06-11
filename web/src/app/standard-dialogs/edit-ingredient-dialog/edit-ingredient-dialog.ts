import { Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Entity } from "../../model/entity";
import { EntityServiceFactory } from "../../services/entity-service-factory";
import { EntityService } from "../../services/entity-service";
import { Cache } from "../../shared/cache/cache";
import { APIResponse } from '../../model/api-response';

@Component({
  selector: 'app-edit-ingredient-dialog',
  templateUrl: './edit-ingredient-dialog.html',
  styleUrls: ['./edit-ingredient-dialog.css']
})
export class EditIngredientDialog implements OnInit {
  
  svc: EntityService

  constructor(
    private svcFactory: EntityServiceFactory,
    public dialogRef: MatDialogRef<EditIngredientDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cache: Cache) { }

  ngOnInit() {
    /* 
    Why this?:
      Because when the ng-select dropdown expands inside the dialog, force the dialog to show a vertical scrollbar. 
      This difficults to visualize the dropdown list and select the appropiate items with ease.
      
      The issue is described here: https://github.com/ng-select/ng-select/issues/240
      
      But the proposed solution is to change manually the CSS file, i think the best is to override the value dinamically. 
    */
    this.dialogRef.afterOpen().subscribe(() => {

      let dlg = document.getElementsByTagName("mat-dialog-container");
      
      if (dlg && dlg.length > 0) {
        (dlg[0] as any).style.overflow = "visible";
      }

    })
  }

  closeDlg(d): void {
    this.dialogRef.close(d);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
