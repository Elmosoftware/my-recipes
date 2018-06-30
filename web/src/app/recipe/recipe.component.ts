import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Rx';

import { StandardDialogService } from "../standard-dialogs/standard-dialog.service";
import { ToasterHelperService } from '../services/toaster-helper-service';
import { Helper } from "../shared/helper";
import { WizardComponent } from "../shared/wizard/wizard.component";
import { SubscriptionService } from "../services/subscription.service";
import { ErrorLog } from '../model/error-log';
import { EntityServiceFactory } from "../services/entity-service-factory";
import { EntityService, EntityServiceQueryParams } from "../services/entity-service";
import { WordAnalyzerService } from "../services/word-analyzer-service";
import { APIResponseParser } from "../services/api-response-parser";
import { Recipe } from "../model/recipe";
import { RecipeIngredient } from "../model/recipe-ingredient";
import { Entity } from "../model/entity";
import { Cache, CACHE_MEMBERS } from "../shared/cache/cache";

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit, AfterViewInit {

  @ViewChild('wizard')
  wizard: WizardComponent;

  isNewRecipe: boolean;
  isCompleted: boolean;
  modelIsReady: boolean;
  model: Recipe;
  globalErrorSubscription: any;
  wordAnalyzer: WordAnalyzerService;
  svcRecipe: EntityService;
  svcIngredient: EntityService;
  helper: Helper;
  missingIngredients: string[];
  compatibleUnits: Entity[];
  newRecipeIngredient: RecipeIngredient;
  newDirection: string;

  constructor(private zone: NgZone,
    private route: ActivatedRoute,
    private subs: SubscriptionService,
    private dlgSvc: StandardDialogService,
    private svcFactory: EntityServiceFactory,
    private toast: ToasterHelperService,
    private cache: Cache) { }

  precaching() {
    //When editing a recipe seems like the dropdowns are not binding correctly the values if the list of items is not ready.
    //If those caches are stale or never refreshed, they will be refreshed with the following calls:
    this.cache.levels;
    this.cache.mealTypes;
    this.cache.ingredients;
  }

  ngOnInit() {
    //Initializing:
    this.precaching();
    this.isCompleted = false;
    this.modelIsReady = false; //This acts like a flag to know when data retrieval process is ready or not.
    this.wordAnalyzer = new WordAnalyzerService();
    this.helper = new Helper();
    this.svcRecipe = this.svcFactory.getService("Recipe");
    this.svcIngredient = this.svcFactory.getService("Ingredient");
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item));
    this.resetForm();
  }

  ngAfterViewInit() {
  }

  resetForm(forceNewRecipe: boolean = false) {

    this.isNewRecipe = !this.route.snapshot.paramMap.get("id") || forceNewRecipe;

    //If the form was already completed once, we will reset the wizard:
    if (this.isCompleted) {
      this.wizard.reset();
    }

    this.isCompleted = false;

    if (!this.isNewRecipe) {
      this.svcRecipe.getById(this.route.snapshot.paramMap.get("id"), new EntityServiceQueryParams("true"))
        .subscribe(
          data => {
            let response: APIResponseParser = new APIResponseParser(data);

            if (response.entities.length == 0) {
              this.model = null;
            }
            else {
              this.model = (response.entities[0] as Recipe);
            }

            this.modelIsReady = true;
          },
          err => {
            throw err
          });
    }
    else {
      this.model = new Recipe();
      this.modelIsReady = true;
    }

    this.missingIngredients = [];
    this.compatibleUnits = [];
    this.newRecipeIngredient = new RecipeIngredient();
    this.newDirection = "";
  }

  //#region Cache helper methods

  getIngredientFromCache(ingredientOrId: string | object): Entity | null {

    let id: string = "";
    let ing: Entity[];

    if (typeof ingredientOrId == "string") {
      id = ingredientOrId
    }
    else {
      id = (ingredientOrId as Entity)._id;
    }

    ing = this.cache.ingredients.filter(entity => entity._id == id);

    if (Array.isArray(ing) && ing.length > 0) {
      return ing[0];
    }
    else {
      return null;
    }
  }

  getUnitFromCache(unitOrId: string | object): Entity | null {

    let id: string = "";
    let unit: Entity[];

    if (typeof unitOrId == "string") {
      id = unitOrId
    }
    else {
      id = (unitOrId as Entity)._id;
    }

    unit = this.cache.units.filter(entity => entity._id == id);

    if (Array.isArray(unit) && unit.length > 0) {
      return unit[0];
    }
    else {
      return null;
    }
  }
  //#endregion

  //#region "Ingredientes" tab methods

  newIngredient() {

    this.dlgSvc.showEditEntityDialog("Ingredient", this.svcIngredient.getNew()).subscribe(result => {

      console.log(`Dialog closed. Result: "${result}" `);

      //If the user does not cancelled the dialog:
      if (typeof result === "object") {
        
        console.log(`DATA: Name= "${result.name}"`);
        
        this.svcIngredient.save(result).subscribe(data => {

            let respData = new APIResponseParser(data);
            console.log(`After Save`);
            console.log(`Error:"${respData.error}", Payload:"${respData.entities}"`);

            if (!respData.error) {
              this.toast.showSuccess("El ingrediente fué agregado con éxito!");
              //If the entity holds a cache key, we need to invalidate the cache so it will be refreshed next time is accessed:
              if (this.svcIngredient.getCacheKey()) {
                this.cache.invalidateOne(this.svcIngredient.getCacheKey() as CACHE_MEMBERS)
              }
            }
          }, err => {
            throw err
          });
      }
    });
  }

  ingredientSelected() {
    //If the ingredient change, we need to update the list of compatible Units:
    this.newRecipeIngredient.unit = null;

    /*
      Need to do this in order to avoid the following error: 
        "ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked".
    */
    setTimeout(() => {
      this.compatibleUnits = (this.getIngredientFromCache(this.newRecipeIngredient.ingredient) as any).compatibleUnits;
    });
  }

  addIngredient() {
    if (this.ingredientExists(this.newRecipeIngredient.ingredient)) {
      this.toast.showWarning("Verifica la lista de ingredientes agregados y modifica las cantidades de ser necesario.");
    }
    else {
      this.model.ingredients.push(Object.assign({}, this.newRecipeIngredient));
      this.newRecipeIngredient = new RecipeIngredient();
    }
  }

  removeIngredient(id): void {
    this.helper.removeTooltips(this.zone);

    if (typeof id != "string") {
      id = (id as Entity)._id;
    }

    this.model.ingredients = this.model.ingredients.filter(recipeIngredient => {

      let ingredientId: string = "";

      if (typeof recipeIngredient.ingredient == "string") {
        ingredientId = recipeIngredient.ingredient
      }
      else {
        ingredientId = recipeIngredient.ingredient._id;
      }

      return id != ingredientId
    })
  }

  ingredientExists(id): boolean {

    if (typeof id != "string") {
      id = (id as Entity)._id;
    }

    return (this.model.ingredients.find(recipeIngredient => {

      let ingredientId: string = "";

      if (typeof recipeIngredient.ingredient == "string") {
        ingredientId = recipeIngredient.ingredient
      }
      else {
        ingredientId = recipeIngredient.ingredient._id;
      }

      return (id == ingredientId);
    })) ? true : false;
  }
  //#endregion 

  //#region "Preparacion" tab methods

  addDirection(): void {
    this.model.directions.push(this.newDirection);
    this.newDirection = "";
    this.evaluateIngredientUsage();
  }

  editDirection(index): void {

    this.dlgSvc.showRecipeDirectionDialog(this.model.directions[index])
      .subscribe(result => {

        //If the user does not cancelled the dialog:
        if (result && typeof result === "string" && result != "false") {
          this.model.directions[index] = result;
        }

        this.evaluateIngredientUsage();
      });
  }

  moveDirectionDown(index): void {
    let d: string = this.model.directions.splice(index, 1)[0];
    this.model.directions.splice(index + 1, 0, d);
  }

  moveDirectionUp(index): void {
    let d: string = this.model.directions.splice(index, 1)[0];
    this.model.directions.splice(index - 1, 0, d);
  }

  removeDirection(index): void {
    this.model.directions.splice(index, 1);
    this.evaluateIngredientUsage();
  }

  evaluateIngredientUsage(): void {
    if (this.model) {
      let allDirections: string = this.model.directions.join("\n");
      this.missingIngredients = [];

      this.getRecipeIngredientsList().forEach(ingredient => {
        if (this.wordAnalyzer.searchWord(allDirections, ingredient).length == 0) {
          this.missingIngredients.push(ingredient);
        }
      })
    }
  }

  parseIngredientsInDirection(direction: string): string {

    this.getRecipeIngredientsList().forEach((ingredient, i) => {

      let amount: number = this.model.ingredients[i].amount;
      let unit = this.getUnitFromCache(this.model.ingredients[i].unit)
      let unitAbbrev: string = (unit) ? (unit as any).abbrev : "";

      direction = this.wordAnalyzer.searchAndReplaceWord(direction, ingredient,
        `<abbr title="Utilizando ${amount}${unitAbbrev} en esta preparación.">${ingredient}</abbr>`);
    })

    return direction;
  }

  parseRecipeIngredient(recipeIngredient: any): string {

    let ret: string = "";
    let ingredient: any;
    let unit: any;

    if (recipeIngredient) {
      ingredient = this.getIngredientFromCache(recipeIngredient.ingredient);
      unit = this.getUnitFromCache(recipeIngredient.unit);

      if (ingredient) {
        ret += ingredient.name + ", ";
      }

      if (unit) {
        ret += String(recipeIngredient.amount) + unit.abbrev;
      }
    }

    return ret;
  }

  getRecipeIngredientsList(): string[] {

    let ret: string[] = [];

    if (this.model) {
      //If not yet, we cached the current list of ingredients set in the "Ingredientes" form step:
      this.model.ingredients.forEach(item => {
        ret.push((this.getIngredientFromCache(item.ingredient) as any).name)
      })
    }

    return ret;
  }
  //#endregion

  onComplete(event) {

    this.svcRecipe.save(this.model)
      .subscribe(data => {

        let respData = new APIResponseParser(data);
        console.log(`After Save the Recipe!`);
        console.log(`Error:"${respData.error}", Payload:"${respData.entities}"`);

        if (!respData.error) {
          this.toast.showSuccess("Los cambios se guardaron con éxito!");
          this.isCompleted = true;
        }
      }, err => {
        throw err
      });
  }

  onStepChanged(step) {
    //Perform here any initialization required when moving from one step to other:
    this.evaluateIngredientUsage();
  }

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }
}
