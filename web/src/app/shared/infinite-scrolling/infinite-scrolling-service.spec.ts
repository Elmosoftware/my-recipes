import { TestBed, inject } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';

import { InfiniteScrollingService, PagingHelper, SCROLL_POSITION } from "./infinite-scrolling-module";

class PaginationMock {

    constructor(totalCount: number) {
        this.totalCount = totalCount
    }

    public readonly totalCount: number;

    getPage(top: number, skip: number) {

        let ret = [];

        for (let i = (skip + 1); i < (skip + top + 1); i++) {
            ret.push(i);

            if (i == this.totalCount) {
                break;
            }
        }

        return ret;
    }
}

describe("InfiniteScrollingService Class", () => {
    describe("Constructor", () => {
        it(`Must throw an error if the parameter "pageSize" is null.`, () => {
            expect(() => { new InfiniteScrollingService(null) })
                .toThrowError(`The parameter "pageSize" can't be null.`)
        });
        it(`Must throw an error if the parameter "pageSize" is equal to 0.`, () => {
            expect(() => { new InfiniteScrollingService(0) })
                .toThrowError(`The parameter "pageSize" can't be equal or less than zero. Supplied value "0".`)
        });
        it(`Must throw an error if the parameter "pageSize" is less than 0.`, () => {
            expect(() => { new InfiniteScrollingService(-2) })
                .toThrowError(`The parameter "pageSize" can't be equal or less than zero. Supplied value "-2".`)
        });
        it(`Must not throw any error if the parameters are valid.`, () => {
            let svc = new InfiniteScrollingService(50);

            expect(svc.maxRenderedPages).toEqual(2);
            expect(svc.pageSize).toEqual(50);
            expect(svc.model).toBe(null);
            expect(svc.modelCapacity).toEqual(2 * 50);
            expect(svc.count).toEqual(0);
            expect(svc.totalCount).toEqual(0);
        });
    });
    describe("feed()", () => {

        const PAGE_SIZE: number = 10;
        const TOTAL_COUNT: number = 45
        const RENDERED_PAGES: number = 2;

        let p: PaginationMock;
        let svc: InfiniteScrollingService<number>;
        let x: PagingHelper;

        beforeEach(function () {
            p = new PaginationMock(TOTAL_COUNT);
            svc = new InfiniteScrollingService<number>(PAGE_SIZE)
        });

        it(`Must throw an error if the parameter "dataPage" is null.`, () => {
            expect(() => { svc.feed(1, null) })
                .toThrowError(`The parameter "dataPage" can't be null"`);
        });
        it(`Must throw an error if the parameter "dataPage" has more elements than the current page size.`, () => {
            expect(() => { svc.feed(1000, p.getPage(11, 0)) })
                .toThrowError(`The parameter "dataPage" has more data than allowed.\n` +
                    `"dataPage" parameter lenght: 11, defined page size: ${PAGE_SIZE}.`);
        });
        it(`Must throw an error if the parameter "totalCount" is less than the size of the array in the parameter "dataPage".`, () => {
            expect(() => { svc.feed(1, [1, 2, 3, 4, 5]) })
                .toThrowError(`You are trying to add more data than the value currently specified for the "totalCount" property.\n` +
                    `"totalCount": 0, "count": 0, "dataPage" parameter lenght: 5.\n` +
                    `This means you are trying to add 5 extra items.`);
        });
        it(`Must not throw any error if the parameters are valid.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0));

            expect(svc.model.length).toEqual(PAGE_SIZE);
            expect(svc.pageSize).toEqual(PAGE_SIZE);
            expect(svc.maxRenderedPages).toEqual(RENDERED_PAGES);
            expect(svc.modelCapacity).toEqual(PAGE_SIZE * RENDERED_PAGES);
            expect(svc.totalCount).toEqual(TOTAL_COUNT);
        });
        it(`Adding 2 pages of data. "count" = "model.length" = 20.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0));
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0));

            expect(svc.model.length).toEqual(PAGE_SIZE * 2);
            expect(svc.count).toEqual(PAGE_SIZE * 2);
        });
        it(`Adding 3 pages of data. "model.length" still 20 while count is now 30.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0));
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0));
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0));

            expect(svc.model.length).toEqual(PAGE_SIZE * 2);
            expect(svc.count).toEqual(PAGE_SIZE * 3);
        });
    });
    describe("onscrollEndHandler() - With a last page size less than 'svc.pageSize', (45 items in pages of 10, last page size = 5)", () => {

        const PAGE_SIZE: number = 10;
        const TOTAL_COUNT: number = 45
        const RENDERED_PAGES: number = 2;

        let p: PaginationMock;
        let svc: InfiniteScrollingService<number>;

        beforeEach(function () {
            p = new PaginationMock(TOTAL_COUNT);
            svc = new InfiniteScrollingService<number>(PAGE_SIZE)
        });
        it(`Adding 1st page and scrolling down.`, (done) => {

            let ev: EventEmitter<PagingHelper> = svc.dataFeed.subscribe((ph: PagingHelper) => {
                expect(ph.top).toEqual(PAGE_SIZE);
                expect(ph.skip).toEqual(PAGE_SIZE);
                done();
            })

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            expect(svc.count).toEqual(PAGE_SIZE);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
        });
        it(`Adding 2nd page and scrolling down.`, (done) => {

            let dataFeedCount: number = 1;

            let ev: EventEmitter<PagingHelper> = svc.dataFeed.subscribe((ph: PagingHelper) => {
                expect(ph.top).toEqual(PAGE_SIZE);
                expect(ph.skip).toEqual(PAGE_SIZE * dataFeedCount);
                
                switch (dataFeedCount) {
                    case 1:
                        expect(svc.model).toEqual([
                            1,   2,  3,  4,  5,  6,  7,  8,  9, 10]);
                        break;
                    case 2:
                        expect(svc.model).toEqual([
                            1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) 
                        break;
                }      
                
                dataFeedCount++;

                if (dataFeedCount == 3) {
                    done();
                }
            })

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
        });
        it(`Adding 3rd page and scrolling down.`, (done) => {

            let dataFeedCount: number = 1;

            let ev: EventEmitter<PagingHelper> = svc.dataFeed.subscribe((ph: PagingHelper) => {
                expect(ph.top).toEqual(PAGE_SIZE);
                expect(ph.skip).toEqual(PAGE_SIZE * dataFeedCount);
                
                switch (dataFeedCount) {
                    case 1:
                        expect(svc.model).toEqual([
                            1,   2,  3,  4,  5,  6,  7,  8,  9, 10]);
                        break;
                    case 2:
                        expect(svc.model).toEqual([
                            1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) 
                        break;
                    case 3:
                        //Because the "svc.renderedPages" limit in 2, we will swap to cache the first page:
                        expect(svc.model).toEqual([
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                            21, 22, 23, 24, 25, 26, 27, 28, 29, 30]) 
                        break;
                }      
                
                dataFeedCount++;

                if (dataFeedCount == 4) {
                    done();
                }
            })

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
        });
        it(`Adding 4th page and scrolling down.`, (done) => {

            let dataFeedCount: number = 1;

            let ev: EventEmitter<PagingHelper> = svc.dataFeed.subscribe((ph: PagingHelper) => {
                expect(ph.top).toEqual(PAGE_SIZE);
                expect(ph.skip).toEqual(PAGE_SIZE * dataFeedCount);
                
                switch (dataFeedCount) {
                    case 1:
                        expect(svc.model).toEqual([
                            1,   2,  3,  4,  5,  6,  7,  8,  9, 10]);
                        break;
                    case 2:
                        expect(svc.model).toEqual([
                            1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) 
                        break;
                    case 3:
                        //Because the "svc.renderedPages" limit in 2, we will swap to cache the first page:
                        expect(svc.model).toEqual([
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                            21, 22, 23, 24, 25, 26, 27, 28, 29, 30]) 
                        break;
                    case 4:
                        //Because the "svc.renderedPages" limit in 2, we will swap to cache the second page:
                        expect(svc.model).toEqual([
                            21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                            31, 32, 33, 34, 35, 36, 37, 38, 39, 40]) 
                        break;
                }      
                
                dataFeedCount++;

                if (dataFeedCount == 5) {
                    done();
                }
            })

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
        });
        it(`Adding 5th page and scrolling down.`, (done) => {

            let dataFeedCount: number = 1;

            let ev: EventEmitter<PagingHelper> = svc.dataFeed.subscribe((ph: PagingHelper) => {
                expect(ph.top).toEqual(PAGE_SIZE);
                expect(ph.skip).toEqual(PAGE_SIZE * dataFeedCount);
                
                switch (dataFeedCount) {
                    case 1:
                        expect(svc.model).toEqual([
                            1,   2,  3,  4,  5,  6,  7,  8,  9, 10]);
                        break;
                    case 2:
                        expect(svc.model).toEqual([
                            1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) 
                        break;
                    case 3:
                        //Because the "svc.renderedPages" limit in 2, we will swap to cache the first page:
                        expect(svc.model).toEqual([
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                            21, 22, 23, 24, 25, 26, 27, 28, 29, 30]) 
                        break;
                    case 4:
                        //Because the "svc.renderedPages" limit in 2, we will swap to cache the second page:
                        expect(svc.model).toEqual([
                            21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                            31, 32, 33, 34, 35, 36, 37, 38, 39, 40]) 
                        break;
                }      
                
                dataFeedCount++;

                //Max datafeedCount in this case will be 5 because the last scroll to bottom will not raise the event, (because 
                //there is no more data to retrieve).
                if (dataFeedCount == 5) { 
                    done();
                }
            })

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 4)); //Adding 5th Page
            expect(svc.count).toEqual(TOTAL_COUNT);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom); //This will do nothing because all the data has been already filled.
        });
        it(`Scroll up one time.`, () => {

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 4)); //Adding 5th Page

            expect(svc.model).toEqual([
                26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 
                36, 37, 38, 39, 40, 41, 42, 43, 44, 45]);

            svc.onScrollEndHandler(SCROLL_POSITION.Top); 

            expect(svc.model).toEqual([
                21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);
        });
        it(`Scroll up two times.`, () => {

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 4)); //Adding 5th Page

            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            svc.onScrollEndHandler(SCROLL_POSITION.Top); 

            expect(svc.model).toEqual([
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
        });
        it(`Scroll up three times.`, () => {

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 4)); //Adding 5th Page

            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            
            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        });
        it(`Scroll up four times.`, () => {

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 4)); //Adding 5th Page

            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            /*
                This last scroll will have not effect at all. This is because the amount of items doesn't fit on full pages 
                for this test, (45 total items in pages of 10 give us a last page of only 5 items). 
                This means that when you start scrolling up and because you need to keep a maximum of 2 rendered pages, the 
                items will be shifted when you initially scroll down to the last page.
            */

            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        });
    });
    describe("onscrollEndHandler() - With a last page size equal to 'svc.pageSize', (40 items in pages of 10, last page size = 10)", () => {

        const PAGE_SIZE: number = 10;
        const TOTAL_COUNT: number = 40
        const RENDERED_PAGES: number = 2;

        let p: PaginationMock;
        let svc: InfiniteScrollingService<number>;

        beforeEach(function () {
            p = new PaginationMock(TOTAL_COUNT);
            svc = new InfiniteScrollingService<number>(PAGE_SIZE)
        });
        
        it(`Adding pages and scroll down.`, (done) => {

            let dataFeedCount: number = 1;

            let ev: EventEmitter<PagingHelper> = svc.dataFeed.subscribe((ph: PagingHelper) => {
                expect(ph.top).toEqual(PAGE_SIZE);
                expect(ph.skip).toEqual(PAGE_SIZE * dataFeedCount);
                
                switch (dataFeedCount) {
                    case 1:
                        expect(svc.model).toEqual([
                            1,   2,  3,  4,  5,  6,  7,  8,  9, 10]);
                        break;
                    case 2:
                        expect(svc.model).toEqual([
                            1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) 
                        break;
                    case 3:
                        //Because the "svc.renderedPages" limit in 2, we will swap to cache the first page:
                        expect(svc.model).toEqual([
                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                            21, 22, 23, 24, 25, 26, 27, 28, 29, 30]) 
                        break;
                }      
                
                dataFeedCount++;

                if (dataFeedCount == 4) {
                    done();
                }
            })

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            expect(svc.count).toEqual(PAGE_SIZE * dataFeedCount);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            expect(svc.count).toEqual(TOTAL_COUNT);
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom); //This will do nothing because all the data has been already filled.
        });
        
        it(`Scroll up one time.`, () => {

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            
            expect(svc.model).toEqual([
                21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                31, 32, 33, 34, 35, 36, 37, 38, 39, 40]) 

            svc.onScrollEndHandler(SCROLL_POSITION.Top); 

            expect(svc.model).toEqual([
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                21, 22, 23, 24, 25, 26, 27, 28, 29, 30]) 
        });
        it(`Scroll up two times.`, () => {

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
           
            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            svc.onScrollEndHandler(SCROLL_POSITION.Top); 

            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) 
        });
        it(`Scroll up three times.`, () => {

            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            
            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            svc.onScrollEndHandler(SCROLL_POSITION.Top); 
            svc.onScrollEndHandler(SCROLL_POSITION.Top); //This last scroll will have not effect at all. 
            
            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        });
    });
    describe("fullScrollUp()", () => {

        const PAGE_SIZE: number = 10;
        const TOTAL_COUNT: number = 45
        const RENDERED_PAGES: number = 2;

        let p: PaginationMock;
        let svc: InfiniteScrollingService<number>;

        beforeEach(function () {
            p = new PaginationMock(TOTAL_COUNT);
            svc = new InfiniteScrollingService<number>(PAGE_SIZE)
        });
        it(`After adding 1st page.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.fullScrollUp();
            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10]);
        });
        it(`After adding 2nd page.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.fullScrollUp();
            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        });
        it(`After adding 3rd page.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.fullScrollUp();
            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        });
        it(`After adding 4th page.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            svc.fullScrollUp();
            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        });
        it(`After adding 5th page.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 4)); //Adding 5th Page
            svc.fullScrollUp();
            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        });        
        it(`Full scroll up twice.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 4)); //Adding 5th Page
            svc.fullScrollUp();
            svc.fullScrollUp(); //This second call has no effect.
            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        });
    });
    describe("fullScrollDown()", () => {

        const PAGE_SIZE: number = 10;
        const TOTAL_COUNT: number = 45
        const RENDERED_PAGES: number = 2;

        let p: PaginationMock;
        let svc: InfiniteScrollingService<number>;

        beforeEach(function () {
            p = new PaginationMock(TOTAL_COUNT);
            svc = new InfiniteScrollingService<number>(PAGE_SIZE)
        });
        it(`After adding 1st page.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.fullScrollDown();
            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10]);
        });
        it(`After adding 2nd page.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.fullScrollDown();
            expect(svc.model).toEqual([
                1,   2,  3,  4,  5,  6,  7,  8,  9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        });
        it(`After adding 3rd page.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.fullScrollDown();
            expect(svc.model).toEqual([
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
        });
        it(`After adding 4th page.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            svc.fullScrollDown();
            expect(svc.model).toEqual([
                21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);
        });
        it(`After adding 5th page.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 4)); //Adding 5th Page
            svc.fullScrollDown();
            expect(svc.model).toEqual([
                26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 
                36, 37, 38, 39, 40, 41, 42, 43, 44, 45]);
        });
        it(`Full scroll down twice.`, () => {
            svc.feed(p.totalCount, p.getPage(svc.pageSize, 0)); //Adding 1st Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE)); //Adding 2nd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 2)); //Adding 3rd Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 3)); //Adding 4th Page
            svc.onScrollEndHandler(SCROLL_POSITION.Bottom);
            svc.feed(p.totalCount, p.getPage(svc.pageSize, PAGE_SIZE * 4)); //Adding 5th Page
            svc.fullScrollDown();
            svc.fullScrollDown();
            expect(svc.model).toEqual([
                26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 
                36, 37, 38, 39, 40, 41, 42, 43, 44, 45]);
        });
    });
});

