/**
 * This class holds a cached value and optionally a reference to a method used to refresh the value.
 * Main responsibility of this class is to report when the cached data got stale.
 */
export class CacheItem {

    /**
     * 
     * @param key The cache item key. This value must be unique and cannot be changed after instance creation.
     * @param duration Time in seconds after the cache will considered stale.
     * @param defaultValue This is the value returned when no value was already set for this cache item or when the cache got stale.
     */
    constructor(key: string, duration?: number, defaultValue?: any) {
        this.key = key;
        this.defaultValue = (defaultValue == null || defaultValue == undefined) ? undefined : defaultValue;
        this.duration = (duration && duration > 0) ? duration : this.DEFAULT_DURATION;
        this.invalidate();
    }

    public readonly DEFAULT_DURATION: number = 60;
    public readonly key: string;
    public duration: number;
    public defaultValue: any;
    private _value: any;
    private _refreshThisArg: object;
    private _refreshFunction: Function;
    private _lastRefresh: Date;

    /**
     * This method allows to hold a reference to the refresh method to renew the cached value.
     * @param refreshThisArg "this" argument for the refresh method call. Usually the instance of the class holding the method.
     * @param refreshFunction Reference to the method to be called when the cache got stale.
     */
    public setRefreshCallback(refreshThisArg: object, refreshFunction: Function) {
        this._refreshThisArg = refreshThisArg;
        this._refreshFunction = refreshFunction;
    }

    /**
     * @returns The cached value or the default value in the case the value has not been set or got stale.
     */
    public get value(): any {
        if (this._value == undefined && this.defaultValue != undefined) {
            this.value = JSON.parse(JSON.stringify(this.defaultValue))
        }
        return this._value;
    }

    /**
     * Set the cached value.
     */
    public set value(val) {
        this._value = val;
    }

    /**
     * Calls the refresh method set in "setRefreshCallback".
     * IMPORTANT: This method do not set the cached value.
     * @returns Whatever the refresh method returns.
     */
    public refresh(): any {
        this._lastRefresh = new Date();
        return this._refreshFunction.call(this._refreshThisArg);
    }

    /**
     * Returns a timestamp indicating when When the cache was last refreshed.
     * If the cache value was never set or the cache was invalidated, this value will be "null".
     */
    public get lastRefresh() {
        return this._lastRefresh;
    }

    /**
     * How much time the cache will remain valid, (not stale).
     */
    public get remainingTime(): number {
        let ret: number = 0;
        let d: Date;
        let current = new Date();

        if (this._lastRefresh) {
            d = new Date(this._lastRefresh)
            d.setSeconds(d.getSeconds() + this.duration)

            if (d >= current) {
                ret = (d.getTime() - current.getTime()) / 1000;
            }
        }

        return ret
    }

    /**
     * Indicates if the cache remains valid, (not stale).
     */
    public get isValid(): boolean {
        return (this.remainingTime > 0);
    }

    /**
     * Force cache invalidation turning it immediately invalid, (stale).
     */
    public invalidate() {
        this.value = undefined;
        this._lastRefresh = null;
    }
}