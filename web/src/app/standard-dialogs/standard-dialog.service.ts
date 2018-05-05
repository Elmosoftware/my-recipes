import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

//Entities:
import { Entity } from "../model/entity";

//Dialog Components:
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { EditLevelDialog } from "../standard-dialogs/edit-level-dialog/edit-level-dialog";
import { EditMealTypeDialog } from "../standard-dialogs/edit-mealtype-dialog/edit-mealtype-dialog";
import { EditUnitDialog } from "../standard-dialogs/edit-unit-dialog/edit-unit-dialog";
import { EditIngredientDialog } from "../standard-dialogs/edit-ingredient-dialog/edit-ingredient-dialog";

@Injectable()
export class StandardDialogService {

  private entityDialogDefs = {
    Level: EditLevelDialog,
    MealType: EditMealTypeDialog,
    Unit: EditUnitDialog,
    Ingredient: EditIngredientDialog
  };

  constructor(public dialog: MatDialog) {
  }
  
  showConfirmDialog(options: ConfirmDialogConfiguration): Observable<any> {
    
    let dialogRef = this.dialog.open(ConfirmDialogComponent, { data: options });

    return dialogRef.afterClosed();
  }

  showEditEntityDialog(entityName: any, entityData: Entity): Observable<any> {

    if (this.entityDialogDefs[entityName]) {
      return this.dialog.open(this.entityDialogDefs[entityName], { data: entityData })
        .afterClosed();
    }
    else{
      throw new Error(`There is no edit dialog defined for an entity named "${entityName}".`);
    }
  }
}

export class ConfirmDialogConfiguration {

  constructor(title:string, content:string, firstButtonText?:string, secondButtonText?:string) { 
    this.title = (title) ? title : "Confirmar acción";
    this.content = (content) ? content : "¿Está seguro de continuar?";
    this.firstButtonText = (firstButtonText) ? firstButtonText : "Aceptar";
    this.secondButtonText = (secondButtonText) ? secondButtonText : "Cancelar";
  }

  title: string;
  content: string;
  firstButtonText: string;
  secondButtonText: string;
}