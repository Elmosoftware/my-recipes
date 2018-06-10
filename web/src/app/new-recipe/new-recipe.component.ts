import { Component, OnInit, AfterViewInit, NgZone, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { WizardComponent } from "../shared/wizard/wizard.component";
import { SubscriptionService } from "../services/subscription.service";
import { ErrorLog } from '../model/error-log';
import { EntityServiceFactory } from "../services/entity-service-factory";
import { EntityService } from "../services/entity-service";
import { WordAnalyzerService } from "../services/word-analyzer-service";
import { APIResponse } from '../model/api-response';
import { Recipe } from "../model/recipe";
import { RecipeIngredient } from "../model/recipe-ingredient";
import { Entity } from "../model/entity";
import { Cache } from "../shared/cache/cache";

@Component({
  selector: 'app-new-recipe',
  templateUrl: './new-recipe.component.html',
  styleUrls: ['./new-recipe.component.css']
})
export class NewRecipeComponent implements OnInit, AfterViewInit {

  @ViewChild('wizard') 
	wizard: WizardComponent;

  isCompleted: boolean;
  globalErrorSubscription: any;
  wordAnalyzer: WordAnalyzerService;
  recipe: Recipe;
  svcRecipe: EntityService;
  missingIngredients: string[];
  compatibleUnits: Entity[];
  newRecipeIngredient: RecipeIngredient;
  newDirection: string;

  constructor(private subs: SubscriptionService,
    private svcFactory: EntityServiceFactory,
    private zone: NgZone,
    private toastr: ToastrService,
    private cache: Cache) { }

  ngOnInit() {
    //Initializing Services and Subscriptions:
    this.wordAnalyzer = new WordAnalyzerService();
    this.svcRecipe = this.svcFactory.getService("Recipe");
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item));
    this.resetForm();
  }

  ngAfterViewInit() {
  }

  resetForm(){

    //If the form was already completed once, we will reset the wizard:
    if (this.isCompleted) {
      this.wizard.reset();
    }

    this.isCompleted = false;
    this.missingIngredients = [];
    this.compatibleUnits = [];
    this.recipe = new Recipe();
    this.newRecipeIngredient = new RecipeIngredient();
    this.newDirection = "";
  }

  ingredientSelected() {
    //If the ingredient change, we need to update the list of compatible Units:
    this.newRecipeIngredient.unit = null;

    /*
      Need to do this in order to avoid the following error: 
        "ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked".
    */
    setTimeout(() => {
      this.compatibleUnits = (this.getCachedIngredientById(this.newRecipeIngredient.ingredient) as any).compatibleUnits;
    });
  }

  addIngredient() {
    if (this.ingredientExists(this.newRecipeIngredient.ingredient)) {
      this.zone.run(() => {
        this.toastr.warning("Verifica la lista de ingredientes agregados y modifica las cantidades de ser necesario.",
          'El ingrediente ya está en tu lista!');
      });
    }
    else {
      this.recipe.ingredients.push(Object.assign({}, this.newRecipeIngredient));
      this.newRecipeIngredient = new RecipeIngredient();
    }
  }

  removeIngredient(id): void {
    this.recipe.ingredients = this.recipe.ingredients.filter(entity => entity.ingredient != id)
  }

  ingredientExists(id): boolean {
    return (this.recipe.ingredients.find(entity => { return (entity.ingredient == this.newRecipeIngredient.ingredient) })) ? true : false;
  }

  addDirection(): void {
    this.recipe.directions.push(this.newDirection);
    this.newDirection = "";
    this.evaluateIngredientUsage();
  }

  moveDirectionDown(index): void {
    let d: string = this.recipe.directions.splice(index, 1)[0];
    this.recipe.directions.splice(index + 1, 0, d);
  }

  moveDirectionUp(index): void {
    let d: string = this.recipe.directions.splice(index, 1)[0];
    this.recipe.directions.splice(index - 1, 0, d);
  }

  removeDirection(index): void {
    this.recipe.directions.splice(index, 1);
    this.evaluateIngredientUsage();
  }

  evaluateIngredientUsage(): void {

    let allDirections: string = this.recipe.directions.join("\n");
    this.missingIngredients = [];

    this.getCachedRecipeIngredientsList().forEach(ingredient => {
      if (this.wordAnalyzer.searchWord(allDirections, ingredient).length == 0) {
        this.missingIngredients.push(ingredient);
      }
    })
  }

  parseIngredientsInDirection(direction: string): string {

    this.getCachedRecipeIngredientsList().forEach((ingredient, i) => {

      let amount: number = this.recipe.ingredients[i].amount;
      let unit = this.getCachedUnitById(this.recipe.ingredients[i].unit)
      let unitAbbrev: string = (unit) ? (unit as any).abbrev : "";

      direction = this.wordAnalyzer.searchAndReplaceWord(direction, ingredient,
        `<abbr title="Utilizando ${amount}${unitAbbrev} en esta preparación.">${ingredient}</abbr>`);
    })

    return direction;
  }

  parseRecipeIngredient(recipeIngredient: any): string {

    let ret: string = "";
    let ingredient: any = this.getCachedIngredientById(recipeIngredient.ingredient);
    let unit: any = this.getCachedUnitById(recipeIngredient.unit);

    if (ingredient) {
      ret += ingredient.name + ", ";
    }

    if (unit) {
      ret += String(recipeIngredient.amount) + unit.abbrev;
    }

    return ret;
  }

  getCachedRecipeIngredientsList(): string[] {

    let ret: string[] = [];

    //If not yet, we cached the current list of ingredients set in the "Ingredientes" form step:
    this.recipe.ingredients.forEach(item => {
      ret.push((this.getCachedIngredientById(item.ingredient) as any).name)
    })

    return ret;
  }

  getCachedIngredientById(id): Entity | null {

    let ing = this.cache.ingredients.filter(entity => entity._id == id);

    if (Array.isArray(ing) && ing.length > 0) {
      return ing[0];
    }
    else {
      return null;
    }
  }

  getCachedUnitById(id): Entity | null {

    let unit = this.cache.units.filter(entity => entity._id == id);

    if (Array.isArray(unit) && unit.length > 0) {
      return unit[0];
    }
    else {
      return null;
    }
  }

  onComplete(event) {

    this.svcRecipe.save(this.recipe)
      .subscribe(data => {

        let respData = new APIResponse(data);
        console.log(`After Save the Recipe!`);
        console.log(`Error:"${respData.error}", Payload:"${respData.entities}"`);

        if (respData.error) {
          throw respData.error
        }
        else {
          this.zone.run(() => {
            this.toastr.success("Los cambios se guardaron con éxito!", 'Ok!');
          });
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
    this.zone.run(() => {
      this.toastr.error(item.getUserMessage(), 'Ooops!, algo no anduvo bien... :-(');
    });
  }
}
