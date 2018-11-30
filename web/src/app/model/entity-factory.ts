//Model
import { Entity } from "./entity";
import { Level } from "./level";
import { MealType } from "./mealtype";
import { Unit } from "./unit";
import { Ingredient } from "./ingredient";
import { RecipeIngredient } from "./recipe-ingredient";
import { Recipe } from "./recipe";
import { CACHE_MEMBERS } from "../shared/cache/cache";

export class EntityFactory {

    private entityDefs = {
        Level: new EntityDef(Level, "levels", () => { return new Level(); }, CACHE_MEMBERS.Levels),
        MealType: new EntityDef(MealType, "mealtypes", () => { return new MealType(); }, CACHE_MEMBERS.MealTypes),
        Unit: new EntityDef(Unit, "units", () => { return new Unit(); }, CACHE_MEMBERS.Units),
        Ingredient: new EntityDef(Ingredient, "ingredients", () => { return new Ingredient(); }, CACHE_MEMBERS.Ingredients),
        RecipeIngredient: new EntityDef(RecipeIngredient, "recipeingredients", () => { return new RecipeIngredient(); }),
        Recipe: new EntityDef(Recipe, "recipes", () => { return new Recipe(); }, CACHE_MEMBERS.LatestRecipes)
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

        constructor(type: Function, apiFunction: string, getInstanceFunc: Function, cacheKey?: CACHE_MEMBERS) {
            this.type = type
            this.apiFunction = apiFunction;
            this.getInstanceFunc = getInstanceFunc;
            this.cacheKey = (cacheKey) ? cacheKey : "";
        }
        
        type: Function;

        apiFunction: string;
        
        getInstance(): Entity {
            return this.getInstanceFunc();
        }

        cacheKey: string;
    }
    