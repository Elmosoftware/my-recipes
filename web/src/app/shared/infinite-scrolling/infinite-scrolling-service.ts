import { EventEmitter } from '@angular/core';

import { SCROLL_POSITION } from "./infinite-scrolling-directive";
import { PagerService, PagingHelper } from "../../services/pager-service";

/**
 * @class InfiniteScrollingService
 * 
 * This class can integrate with the infinite scrolling directive and provides the ability to:
 * 
 * * **Ask to feed data as required**: Every time you scroll down and new data is available for the user, the event 
 * "dataFeed" will be raised so new data can be added to the model. Only a portion of this data will be included in the 
 * "model" attribute for rendering, the rest of the data will remain in an internal cache. This service will take care of 
 * add this data back to the model if the user request it by scrolling up in the UI.
 * * **Cache the results**: Every page already retrieved and not rendered will be kept in an internal cache.
 * * **Render just a part of the total results**: The most important about this service is that you will not be rendering 
 * all the data, but just a portion of it. When you keep in the DOM all the data things will get slower. 
 */
export class InfiniteScrollingService<T> {

    /**
     * @constructor
     * Create the Service instance by setting initial parameters. 
     * This parameters can't be changed later.
     * @param pageSize Data page size. Please follow these recomendations when chosing the right page size:
     * 
     * * The selected page size must be big enough to cause an scroll in the UI.
     * 
     * * The service will always keep in the attribute "model" a maximum of "maxRenderedPages" pages of data. You can 
     * check the "modelCapacity" attribute to get the value.  
     */
    constructor(pageSize: number) {

        let errorMsg: string = "";

        if (pageSize == null || pageSize == undefined) {
            errorMsg = `The parameter "pageSize" can't be null.`;
        }
        else if (typeof pageSize != "number") {
            errorMsg = `The parameter "pageSize" is not a number. Supplied value "${pageSize}".`;
        }
        else if (pageSize <= 0) {
            errorMsg = `The parameter "pageSize" can't be equal or less than zero. Supplied value "${pageSize}".`;
        }

        if (errorMsg) {
            throw new Error(errorMsg);
        }

        this.maxRenderedPages = 2; //Will always render 2 pages of data.
        this._pager = new PagerService(pageSize);
        this.modelChanged = new EventEmitter();
        this.dataFeed = new EventEmitter<PagingHelper>();
        this._model = null;
        this._cache = new PageCache<T>();
    }

    private _model: T[];

    private _cache: PageCache<T>;

    private _pager: PagerService;

    /**
     * Maximum number of data pages that will be incuded in the model at any time.
     * This value is readonly and is set when the instance is created.
     */
    public readonly maxRenderedPages: number;

    /**
     * Defined size of each data page.
     * This value is readonly and is set when the instance is created. Chech the constructor help
     */
    public get pageSize(): number {
        return this._pager.pageSize
    }

    /**
     * Data that need to be rendered. This property must be used for angular binding.
     */
    public get model(): T[] {
        return this._model;
    }

    /**
     * Maximum number of items the model can include and therefore will be rendered in the UI.
     */
    public get modelCapacity(): number {
        return this.maxRenderedPages * this.pageSize;
    }

    /**
     * Amount of items expected to be handled by the service. This value can be set on each call to the "feed" method.
     */
    public get totalCount(): number {
        return this._pager.totalItems;
    }

    /**
     * Amount of items already retrieved. This means the total items in "model" that are rendered plus cached ones.
     */
    get count(): number {
        let ret: number = 0;

        if (this._model) {
            ret = this._model.length + this._cache.totalItems;
        }

        return ret;
    }

    /**
     * This event will raise every time the model changed. This can be caused by adding data or scrolling.
     */
    public modelChanged: EventEmitter<boolean>;

    /**
     * This event will be raised every time the user scrolls to the bottom and new data is needed.
     * The parameter is a PagingHelper object that includes the  required information to retrive the next data page.
     */
    public dataFeed: EventEmitter<PagingHelper>;

    /**
     * In order to start using the service and also every time the "DataFeed" event is raised, you need to call this 
     * method providing the next page of data.
     * @param totalCount Total items that need to be handled by the service.
     * @param dataPage Items included in this data page.
     */
    public feed(totalCount: number, dataPage: T[]) {
        let errorMsg: string = "";

        if (!dataPage) {
            errorMsg = `The parameter "dataPage" can't be null"`;
        }
        else if (!Array.isArray(dataPage)) {
            errorMsg = `The parameter "dataPage" is not an array."`;
        }
        else if (dataPage.length > this.pageSize) {
            errorMsg = `The parameter "dataPage" has more data than allowed.\n` +
                `"dataPage" parameter lenght: ${dataPage.length}, defined page size: ${this.pageSize}.`
        }
        else if (totalCount < (dataPage.length + this.count)) {
            errorMsg = `You are trying to add more data than the value currently specified for the "totalCount" property.\n` +
                `"totalCount": ${this.totalCount}, "count": ${this.count}, "dataPage" parameter lenght: ${dataPage.length}.\n` +
                `This means you are trying to add ${Math.abs(this.totalCount - this.count - dataPage.length)} extra items.`;
        }

        if (errorMsg) {
            throw new Error(errorMsg);
        }

        this._pager.totalItems = totalCount;
        this._addToModel(SCROLL_POSITION.Bottom, dataPage);
    }

    /**
     * Because we are rendering a partial view of the data we need a way to go back to the first page of data. In the 
     * same way you can achieve normally hitting CTRL-HOME if you are rendering all the data.
     */
    fullScrollUp() {
        //If we go to the first item in the entire list, we will need to add to the model all the cached pages up:
        //NOTE: I'm aware this is not the most performant way to do this, but is the easiest :-)
        while (this._cache.up.length > 0) {
            this._addToModel(SCROLL_POSITION.Top, this._cache.up.pop())
        }
    }

    /**
     * Because we are rendering a partial view of the data we need a way to go back to the first page of data. In the 
     * same way you can achieve normally hitting CTRL-END if you are rendering all the data. 
     */
    fullScrollDown() {
        while (this._cache.down.length > 0) {
            this._addToModel(SCROLL_POSITION.Bottom, this._cache.down.pop())
        }
    }

    /**
     * This method must be set as handler for the "scrollEnd" event of the InfiniteScrolling directive.
     * @param position Actual scroll position.
     */
    public onScrollEndHandler(position: SCROLL_POSITION = SCROLL_POSITION.Top) {

        if (position == SCROLL_POSITION.Bottom) { //If we scrolled to the bottom:
            //If there is some cached pages we added back to the model:
            if (this._cache.down.length > 0) {
                this._addToModel(position, this._cache.down.pop());
            }
            //If there is nothing on the cache, but we still need to retrieve pages from API:
            else if (this._pager.hasNextPage) {
                this.dataFeed.emit(this._pager.moveNext());
            }
            //This is inconsistent: Means that we have nothing on both, cache and model but we 
            //still receiving a scroll event!
            else if (this.count == 0) {
                console.warn(`Ignoring scroll event for position ${position} because no data was added yet!.\n` +
                    `Be sure to call "feed()" with the data the service must handle and use the attribute "model" to bind ` +
                    `the data in your component`);
            }
        }
        else { //If we scrolling to the top and there is cached pages to show:
            if (this._cache.up.length > 0) {
                this._addToModel(position, this._cache.up.pop())
            }
        }
    }

    private _addToModel(position: SCROLL_POSITION, items: T[]) {

        let itemsToMove: number = 0;

        if (!this._model) {
            this._model = items;
        }
        else {
            //If there is no space for another page of data:
            if (this._model.length + items.length > this.modelCapacity) {
                itemsToMove = this.modelCapacity - this._model.length + items.length;
            }

            //Depending on the actual scroll position, we need to add this page of data before 
            //or after the current displayed data:
            if (position == SCROLL_POSITION.Bottom) {

                if (itemsToMove > 0) {
                    //We will add to the "Up" cache the first displayed page:
                    this._cache.up.push(this._model.splice(0, itemsToMove));
                }

                this._model = this._model.concat(items);
            }
            else { //If we Scrolled UP:

                if (itemsToMove > 0) { //We add the excedent items to the "Down" cache:
                    this._cache.down.push(this._model.splice(this._model.length - itemsToMove, itemsToMove));
                }

                this._model = items.concat(this._model);
            }
        }

        this.modelChanged.emit(true);
    }
}

class PageCache<T>{

    constructor() {
        this.up = new Array<T[]>();
        this.down = new Array<T[]>()
    }

    public up: Array<T[]>;
    public down: Array<T[]>;

    public get totalPages(): number {
        return ((this.up && Array.isArray(this.up)) ? this.up.length : 0) + 
            ((this.up && Array.isArray(this.up)) ? this.up.length : 0);
    }

    public get totalItems(): number {

        let ret: number = 0; 

        if (this.up && Array.isArray(this.up) && this.up.length > 0) {
            this.up.forEach( page => {
                ret += page.length;
            })
        }

        if (this.down && Array.isArray(this.down) && this.down.length > 0) {
            this.down.forEach( page => {
                ret += page.length;
            })
        }

        return ret;
    }
}
