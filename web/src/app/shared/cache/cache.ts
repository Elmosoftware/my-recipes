import { Injectable } from '@angular/core';
import { EntityServiceFactory } from "../../services/entity-service-factory";
import { EntityService } from "../../services/entity-service";
import { APIResponseParser } from "../../services/api-response-parser";
import { Entity } from "../../model/entity";
import { CacheItem } from "./cache-item";
import { CacheRepository } from "./cache-repository";

export const enum CACHE_MEMBERS {
    Ingredients = "INGREDIENTS",
    Levels = "LEVELS",
    MealTypes = "MEALTYPES",
    Units = "UNITS"
};

@Injectable()
export class Cache extends CacheRepository {

    private svcIngredient: EntityService;
    private svcLevel: EntityService;
    private svcMealType: EntityService;
    private svcUnit: EntityService;

    private readonly DEFAULT_DURATION: number = (10 * 60); //Default 10 minutes cache duration.

    constructor(private svcFactory: EntityServiceFactory) {
        super();
        console.log("Cache Created");
        
        /*
            We set this cache in the service factory: (This will enable the services to invalidate caches on CRUD ops as needed):
            It will be easier to add "Cache" as a dependency on the Services itself, but there will be a circular dependency issue :-)
        */
        svcFactory.setCache(this);

        this.svcIngredient = this.svcFactory.getService("Ingredient");
        this.svcLevel = this.svcFactory.getService("Level");
        this.svcMealType = this.svcFactory.getService("MealType");
        this.svcUnit = this.svcFactory.getService("Unit");

        this.initialize();
    }

    private initialize(): void {
        super.add(this.createCacheIngredients());
        super.add(this.createCacheLevels());
        super.add(this.createCacheMealTypes());
        super.add(this.createCacheUnits());
    }

    private refreshStaleCache(item: CacheItem): void {
        if (!item.isValid) {
            item.refresh().then(data => {
                item.value = data;
                console.log(`CACHE REFRESHED for: ${item.key}`)
            });
        }
    }

    public invalidateOne(key: CACHE_MEMBERS){
        let item: CacheItem = super.get(key);
        console.log(`CACHE INVALIDATED for: ${item.key}`)
        item.invalidate();
    }

    public invalidateAll(){
        console.log("ALL CACHE INVALIDATED");
        super.invalidate();
    }

    //#region Ingredients
    private createCacheIngredients(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.Ingredients, this.DEFAULT_DURATION, { error: "null", payload: "[]" });
        item.setRefreshCallback(this, this.refreshCacheIngredients);
        return item;
    }

    private refreshCacheIngredients(): Promise<Object> {
        return this.svcIngredient.getAll().toPromise();
    }

    public get ingredients(): Entity[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.Ingredients);
        this.refreshStaleCache(item);        
        return new APIResponseParser(item.value).entities;
    }
    //#endregion

    //#region Levels
    private createCacheLevels(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.Levels, this.DEFAULT_DURATION, { error: "null", payload: "[]" });
        item.setRefreshCallback(this, this.refreshCacheLevels);
        return item;
    }

    private refreshCacheLevels(): Promise<Object> {
        return this.svcLevel.getAll().toPromise();
    }

    public get levels(): Entity[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.Levels);
        this.refreshStaleCache(item);
        return new APIResponseParser(item.value).entities
    }
    //#endregion

    //#region MealTypes
    private createCacheMealTypes(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.MealTypes, this.DEFAULT_DURATION, { error: "null", payload: "[]" });
        item.setRefreshCallback(this, this.refreshCacheMealTypes);
        return item;
    }

    private refreshCacheMealTypes(): Promise<Object> {
        return this.svcMealType.getAll().toPromise();
    }

    public get mealTypes(): Entity[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.MealTypes);
        this.refreshStaleCache(item);
        return new APIResponseParser(item.value).entities
    }
    //#endregion
    
    //#region Units
    private createCacheUnits(): CacheItem {
        let item: CacheItem = new CacheItem(CACHE_MEMBERS.Units, this.DEFAULT_DURATION, { error: "null", payload: "[]" });
        item.setRefreshCallback(this, this.refreshCacheUnits);
        return item;
    }

    private refreshCacheUnits(): Promise<Object> {
        return this.svcUnit.getAll().toPromise();
    }

    public get units(): Entity[] {
        let item: CacheItem = super.get(CACHE_MEMBERS.Units);
        this.refreshStaleCache(item);
        return new APIResponseParser(item.value).entities
    }
    //#endregion
}