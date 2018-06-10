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

    get estimatedFriendlyTime(): string{      

        let hours: number = Math.trunc(this.estimatedTime/60);
        let mins: number = (hours > 0) ? this.estimatedTime - (hours * 60) : this.estimatedTime;
        let ret: string = "";

        if (hours > 0) {
            ret += `${hours} hora`;
        }

        if (hours > 1) {
            ret += "s";
        }

        if (hours > 0 && mins > 0) {
            ret += " y ";
        }

        if(mins > 0 || (hours + mins == 0)){
            ret += `${mins} minutos`
        }

        return ret;
    }
}
