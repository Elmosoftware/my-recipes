import { Injectable } from '@angular/core';
import { EntityServiceFactory } from "../../services/entity-service-factory";
import { EntityService } from "../../services/entity-service";
import { APIResponse } from '../../model/api-response';
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

    private readonly DEFAULT_DURATION: number = 60;

    constructor(private svcFactory: EntityServiceFactory) {
        
        super();
        
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
            });
        }
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
        // ///////////////////////////////////////////////////////////
        // //DEBUG ONLY:
        // console.log(`CACHE STATS - Dur:${item.duration}, LastRef:${item.lastRefresh}, Rem:${item.remainingTime} - Now:${new Date()}`);
        // ///////////////////////////////////////////////////////////
        return this.processAPIResponse(item.value);
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
        return this.processAPIResponse(item.value);
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
        return this.processAPIResponse(item.value);
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
        return this.processAPIResponse(item.value);
    }
    //#endregion

    private processAPIResponse(data) {

        let respData = new APIResponse(data);

        if (respData.error) {
            throw respData.error
        }
        else {
            return respData.entities;
        }
    }
}