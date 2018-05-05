//Model
import { Entity } from "./entity";
import { Level } from "./level";
import { MealType } from "./mealtype";
import { Unit } from "./unit";
import { Ingredient } from "./ingredient";
import { RecipeIngredient } from "./recipe-ingredient";
import { Recipe } from "./recipe";

export class EntityFactory {

    private entityDefs = {
        Level: new EntityDef(Level, "levels", () => { return new Level(); }),
        MealType: new EntityDef(MealType, "mealtypes", () => { return new MealType(); }),
        Unit: new EntityDef(Unit, "units", () => { return new Unit(); }),
        Ingredient: new EntityDef(Ingredient, "ingredients", () => { return new Ingredient(); }),
        RecipeIngredient: new EntityDef(RecipeIngredient, "recipeingredients", () => { return new RecipeIngredient(); }),
        Recipe: new EntityDef(Recipe, "recipes", () => { return new Recipe(); })
    };

    constructor() { }

    exists(entityName: string): boolean {
        return (this.entityDefs[entityName]) as boolean;
    }

    getEntityDef(entityName: string): EntityDef {

        if(!this.exists(entityName)) {
            throw new Error(`There is no entity defined with name "${entityName}".`);
        }
        
        return this.entityDefs[entityName]
    }

    getInstanceOf(entityName: string): Entity {
        return this.entityDefs[entityName].getInstance();
    }
}

export class EntityDef {
    
        private getInstanceFunc: Function;

        constructor(type: Function, apiFunction: string, getInstanceFunc: Function) {
            this.type = type
            this.apiFunction = apiFunction;
            this.getInstanceFunc = getInstanceFunc;
        }
        
        type: Function;

        apiFunction: string;
        
        getInstance(): Entity {
            return this.getInstanceFunc();
        }
    }
    