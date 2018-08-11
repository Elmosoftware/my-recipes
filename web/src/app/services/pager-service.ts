/**
 * Pager Service. This act as a helper for paging data results.
 * @class 
 */
export class PagerService {

    private _totalItems: number;
    private _pageSize: number;
    private _currentPage: number;

    /**
     * The class contructor requires to set the page size the service will be using. This can be set in this way only.
     * @param pageSize Page size the pager will use.
     */
    constructor(pageSize: number) {
        this._totalItems = 0;
        this._currentPage = 0;

        if(typeof pageSize != "number"){
            throw new Error(`We expect a number for parameter "pageSize" but we get a "${typeof pageSize}".`)
        }
        if (pageSize <= 0) {
            throw new Error(`The parameter "pageSize" must be greater than zero. Specified value: "${pageSize}".`)
        }

        this._pageSize = pageSize;        
    }

    /**
     * Total of items to be paged.
     * 
     * The specified value must be a number greater or equal to 0. If the current page is no longer valid after setting this 
     * value, "currentPage" will be set to the index of the first available page.
     */
    set totalItems(value: number){
        this.throwIfLessThanZero("totalItems", value);
        this._totalItems = value;
        //If the actual page is not valid now:
        if (!this.isValidPage(this.currentPage)) {
            this.moveFirst();
        }
    }
    get totalItems(): number{
        return this._totalItems;
    }

    /**
     * This method returns true if the Page indicated is valid based on the total items to page and current page size.
     * @param index Page index to validate.
     */
    isValidPage(index:number): boolean{
        return (this.totalPages > 0 && index > 0 && index <= this.totalPages) || (this.totalPages == 0 && index == 0);
    }

    /**
     * This attribute will be true if there is items and the current Page is not the first one.
     */
    get hasPreviousPage(): boolean{
        return this.isValidPage(this._currentPage - 1);
    }

    /**
     * This attribute will be true if there is another page after the current one.
     */
    get hasNextPage(): boolean{
        return this.isValidPage(this._currentPage + 1);
    }

    /**
     * Move the page index to the first available page. If there is no items to page or we currently are in first 
     * page, a call to this method will have no effect.
     */
    moveFirst(): PagingHelper {
        this._currentPage = (this.totalItems > 0) ? 1 : 0;
        return new PagingHelper(this.currentPage, this.totalPages, this.pageSize, this.skip);
    }

    /**
     * Move the page index to the next available page. If there is no next page a call to this method will have no effect.
     */
    moveNext(): PagingHelper{
        if (this.isValidPage(this._currentPage + 1)) {
            this._currentPage++;
        }
        return new PagingHelper(this.currentPage, this.totalPages, this.pageSize, this.skip);       
    }
    
    /**
     * Move the page index to the previous page. If there is no previous page a call to this method will have no effect.
     */
    movePrevious(): PagingHelper{
        if (this.isValidPage(this._currentPage - 1)) {
            this._currentPage--;
        }  
        return new PagingHelper(this.currentPage, this.totalPages, this.pageSize, this.skip);    
    }

    /**
     * Move the page index to the last page. If there is no items to page or we currently are in the last 
     * page, a call to this method will have no effect.
     */
    moveLast(): PagingHelper{
        this._currentPage = this.totalPages;
        return new PagingHelper(this.currentPage, this.totalPages, this.pageSize, this.skip);
    }

    /**
     * If there is no items to page or the provided page index is an invalid one, a call to this method will have no effect.
     * @param pageIndex Page index to set as current.
     */
    goToPage(pageIndex: number): PagingHelper{
        if (this.isValidPage(pageIndex)) {
            this._currentPage = pageIndex;
        }
        return new PagingHelper(this.currentPage, this.totalPages, this.pageSize, this.skip);
    }

    /**
     * Retrieve the current page size set for the pager service.
     */
    get pageSize(): number{
        return this._pageSize;
    }

    /**
     * Return the active page index.
     */
    get currentPage(): number{
        return this._currentPage;
    }

    /**
     * Return a number indicating how many pages will be needed based on the amount of items to page and the current page size.
     */
    get totalPages() :number{
        return Math.ceil(this._totalItems / this._pageSize);;
    }

    /**
     * Retrieve a numeric value indicating how many items are contained in previous pages.
     */
    get skip() :number{
        return ((this._currentPage == 0) ? 0 : this._currentPage - 1) * this._pageSize;
    }

    private throwIfLessThanZero(paramName:string, value: number){
        if (value < 0) {
            throw new Error(`The parameter "${paramName}" cannot be less than zero. Specified value: "${value}".`)
        }
    }
}

/**
 * Paging Helper. This is a helper class returned by every method on the pager service that change the current page.
 * This facilitates retrieving data for the new page providing some basic data like how many elements to skip, the
 * actual page size, etc.
 * @class 
 */
export class PagingHelper{
    /**
     * Constructor
     * @param page Index of the current page.
     * @param pages Total pages based on the current page size and the amount of total items to retrieve.
     * @param top Page size.
     * @param skip How many items need to be skipped to retrieve this page data. Or what's the same: Amount of items contained 
     * in previous pages.
     */
    constructor(page: number, pages: number, top: number, skip: number){
        this.page = page;
        this.pages = pages;
        this.top = top;
        this.skip = skip;
    }

    /**
     * Current page index.
     */
    public readonly page: number;
    /**
     * Total pages based on the current page size and the amount of total items to retrieve.
     */
    public readonly pages: number;
    /**
     * Amount of items to store in this page, (page size).
     */
    public readonly top: number;
    /**
     * Amount of items already included in previous pages.
     */
    public readonly skip: number;
}
