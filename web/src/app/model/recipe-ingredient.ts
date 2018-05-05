import { Entity } from "./entity";
import { Ingredient } from "./ingredient";
import { Unit } from "./unit";
import { Recipe } from "./recipe";

export class RecipeIngredient extends Entity {

    constructor(){
        super();
        this.recipe = null;
        this.ingredient = null;
        this.amount = 0;
        this.unit = null;
    }

    recipe: Recipe;
    ingredient: Ingredient;
    amount: number;
    unit: Unit;
}
