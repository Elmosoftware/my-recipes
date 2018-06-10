import { CacheItem } from "./cache-item";

export class CacheRepository{

    private _pool: CacheItem[];

    constructor(){
        this._pool = [];
    }

    /**
     * Returns the amount of Cache item stored in this repository.
     */
    public get count(): number{
        //"length" property will not work for associative arrays:
        return Object.keys(this._pool).length;
    }

    /**
     * Allows to add a new Cache item to the repository.
     * @param item Cache item to add to the repository.
     */
    public add(item: CacheItem): void{
        this._pool[item.key] = item;
    }

    /**
     * Allows to get a stored cache item from the repository using his key.
     * @param key Key of the cache item to retrieve.
     */
    public get(key: string): CacheItem{

        if (!this._pool[key]) {
            throw new Error(`There is not a cache item with key "${key}" in the cache repository.`)
        }

        return this._pool[key];
    }

    /**
     * Invalidates all the cache items stored in the repository.
     */
    public invalidate(): void{
        for (var key in this._pool) {
            this._pool[key].invalidate();
        }
    }

    /**
     * Allows to remove a cache item by his key. If the item doesn't exists nor action will be taken or exception thrown.
     * @param key Key of the cache item to remove.
     * @returns The specified cache item or "null" if the cache item doesn't exists.
     */
    public remove(key: string): CacheItem{
        let ret: CacheItem = null;
       
        if (this._pool[key]) {
            ret = this._pool[key];
            delete this._pool[key];
        }

        return ret;
    }
}
