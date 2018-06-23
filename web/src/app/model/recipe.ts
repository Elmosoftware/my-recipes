import { Entity } from "./entity";
import { Level } from "./level";
import { MealType } from "./mealtype";
import { RecipeIngredient } from "./recipe-ingredient";

export class Recipe extends Entity {

    constructor(){
        super();
        this.name = "";
        this.description = "";
        this.estimatedTime = 0;
        this.level = null;
        this.mealType = null;
        this.ingredients = [];
        this.directions = [];
    }

    name: string;
    description: string;
    estimatedTime: number;
    level: Level;
    mealType: MealType;
    ingredients: RecipeIngredient[];
    directions: string[];
}
