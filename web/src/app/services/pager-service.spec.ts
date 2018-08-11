import { TestBed, inject } from '@angular/core/testing';
import { PagerService, PagingHelper } from "./pager-service";


describe("PagerService Class", () => {
    describe("Constructor", () => {
        it(`Must throw an error if the parameter "pageSize" is zero.`, () => {
            expect(() => { new PagerService(0) })
                .toThrowError(`The parameter "pageSize" must be greater than zero. Specified value: "0".`)
        });
        it(`Must throw an error if the parameter "pageSize" is a negative number.`, () => {
            expect(() => { new PagerService(-3) })
                .toThrowError(`The parameter "pageSize" must be greater than zero. Specified value: "-3".`)
        });
        it(`Must not throw any if the parameter "pageSize" is a positive number greaterthan "0".`, () => {
            expect((new PagerService(10)).pageSize).toEqual(10);
        });
    });
    describe("totalItems", () => {

        let p: PagerService;

        beforeEach(() => {
            p = new PagerService(10);
        });

        it(`Must not throw any error if the parameter "totalItems" is zero.`, () => {
            p.totalItems = 0;
            expect(p.totalItems).toEqual(0);
        });
        it(`Must throw an error if the parameter "totalItems" is a negative number.`, () => {
            expect(() => { p.totalItems = -3 })
                .toThrowError(`The parameter "totalItems" cannot be less than zero. Specified value: "-3".`)
        });
        it(`Must not throw any if the parameter "totalItems" is a positive number greaterthan "0".`, () => {
            p.totalItems = 10
            expect(p.totalItems).toEqual(10);
        });
        it(`When setting the total items to a value greater than 0, currentPage must move to page 1.`, () => {
            expect(p.currentPage).toEqual(0);
            p.totalItems = 10
            expect(p.totalItems).toEqual(10);
            expect(p.currentPage).toEqual(1);
        });
        it(`When "totalItems" change, current page must remain the same if still valid.`, () => {
            p.totalItems = 100
            p.goToPage(3);
            p.totalItems = 250;
            expect(p.currentPage).toEqual(3);
        });
        it(`When "totalItems" decrements, "currentPage" must be set to first page if is now invalid.`, () => {
            p.totalItems = 100
            p.goToPage(3);
            p.totalItems = 7;
            expect(p.currentPage).toEqual(1);
        });
        it(`When "totalItems" decrements to 0, "currentPage" must be set to page "0" too.`, () => {
            p.totalItems = 100
            p.goToPage(3);
            p.totalItems = 0;
            expect(p.currentPage).toEqual(0);
        });
    });
    describe("isValidPage", () => {

        let p: PagerService;

        beforeEach(() => {
            p = new PagerService(10);
        });

        it(`For PageSize=10 and TotalItems=0 -> 0 is a valid page.`, () => {
            expect(p.isValidPage(0)).toBe(true);
        });
        it(`For PageSize=10 and TotalItems=0 -> 1 is not a valid page.`, () => {
            expect(p.isValidPage(1)).toBe(false);
        });
        it(`For PageSize=10 and TotalItems=0 -> -1 is not a valid page.`, () => {
            expect(p.isValidPage(-1)).toBe(false);
        });
        it(`For PageSize=10 and TotalItems=30 -> 1 is a valid page.`, () => {
            p.totalItems = 30;
            expect(p.isValidPage(1)).toBe(true);
        });
        it(`For PageSize=10 and TotalItems=30 -> 2 is a valid page.`, () => {
            p.totalItems = 30;
            expect(p.isValidPage(2)).toBe(true);
        });
        it(`For PageSize=10 and TotalItems=30 -> 3 is a valid page.`, () => {
            p.totalItems = 30;
            expect(p.isValidPage(3)).toBe(true);
        });
        it(`For PageSize=10 and TotalItems=30 -> 4 is not a valid page.`, () => {
            p.totalItems = 30;
            expect(p.isValidPage(4)).toBe(false);
        });
        it(`For PageSize=10 and TotalItems=30 -> -1 is not a valid page.`, () => {
            p.totalItems = 30;
            expect(p.isValidPage(-1)).toBe(false);
        });
        it(`For a partial filled last page: PageSize=10 and TotalItems=35 -> 1 is a valid page.`, () => {
            p.totalItems = 35;
            expect(p.isValidPage(1)).toBe(true);
        });
        it(`For a partial filled last page: PageSize=10 and TotalItems=35 -> 2 is a valid page.`, () => {
            p.totalItems = 35;
            expect(p.isValidPage(2)).toBe(true);
        });
        it(`For a partial filled last page: PageSize=10 and TotalItems=35 -> 3 is a valid page.`, () => {
            p.totalItems = 35;
            expect(p.isValidPage(3)).toBe(true);
        });
        it(`For a partial filled last page: PageSize=10 and TotalItems=35 -> 4 is a valid page.`, () => {
            p.totalItems = 35;
            expect(p.isValidPage(4)).toBe(true);
        });
        it(`For a partial filled last page: PageSize=10 and TotalItems=35 -> -1 is not a valid page.`, () => {
            p.totalItems = 35;
            expect(p.isValidPage(-1)).toBe(false);
        });
    });
    describe("moveFirst", () => {

        let p: PagerService;
        let ph: PagingHelper;

        beforeEach(() => {
            p = new PagerService(10);
        });

        it(`For PageSize=10 and TotalItems=0 -> Calling moveFirst cause no changes.`, () => {
            expect(p.currentPage).toEqual(0);
            ph = p.moveFirst();
            expect(p.currentPage).toEqual(0);
            expect(ph.page).toEqual(0);
            expect(ph.pages).toEqual(0);
            expect(ph.skip).toEqual(0);
            expect(ph.top).toEqual(10);
        });
        it(`For PageSize=10 and TotalItems=50 -> Calling moveFirst cause no changes.`, () => {
            expect(p.currentPage).toEqual(0);
            p.totalItems = 50
            expect(p.currentPage).toEqual(1);
            ph = p.moveFirst();
            expect(p.currentPage).toEqual(1);
            expect(ph.page).toEqual(1);
            expect(ph.pages).toEqual(5);
            expect(ph.skip).toEqual(0);
            expect(ph.top).toEqual(10);
        });
        it(`For PageSize=10 and TotalItems=50 -> Calling moveNext and then moveFirst cause the index to be 1 again`, () => {
            p.totalItems = 50
            p.moveNext();
            p.moveFirst();
            expect(p.currentPage).toEqual(1);
        });
    });
    describe("moveNext", () => {

        let p: PagerService;
        let ph: PagingHelper;

        beforeEach(() => {
            p = new PagerService(10);
        });

        it(`For PageSize=10 and TotalItems=0 -> Calling moveNext cause no changes.`, () => {
            expect(p.currentPage).toEqual(0);
            p.moveNext();
            expect(p.currentPage).toEqual(0);
        });
        it(`For PageSize=10 and TotalItems=20 -> Calling moveNext change current page to 2.`, () => {
            expect(p.currentPage).toEqual(0);
            p.totalItems = 20
            expect(p.currentPage).toEqual(1);
            ph = p.moveNext();
            expect(p.currentPage).toEqual(2);
            expect(ph.page).toEqual(2);
            expect(ph.pages).toEqual(2);
            expect(ph.skip).toEqual(10);
            expect(ph.top).toEqual(10);
        });
        it(`For PageSize=10 and TotalItems=20 -> Calling moveNext 2 times change current page to 2 (second call has no effect).`, () => {
            p.totalItems = 20
            p.moveNext();
            p.moveNext();
            expect(p.currentPage).toEqual(2);
        });
    });
    describe("movePrevious", () => {

        let p: PagerService;
        let ph: PagingHelper;

        beforeEach(() => {
            p = new PagerService(10);
        });

        it(`For PageSize=10 and TotalItems=0 -> Calling movePrevious cause no changes.`, () => {
            expect(p.currentPage).toEqual(0);
            p.movePrevious();
            expect(p.currentPage).toEqual(0);
        });
        it(`For PageSize=10 and TotalItems=20 -> Calling movePrevious cause no changes.`, () => {
            expect(p.currentPage).toEqual(0);
            p.totalItems = 20
            expect(p.currentPage).toEqual(1);
            p.movePrevious();
            expect(p.currentPage).toEqual(1);
        });
        it(`For PageSize=10 and TotalItems=20 -> Calling movePrevious after moveNext will position the index in first page again.`, () => {
            p.totalItems = 20
            p.moveNext();
            ph = p.movePrevious();
            expect(p.currentPage).toEqual(1);
            expect(ph.page).toEqual(1);
            expect(ph.pages).toEqual(2);
            expect(ph.skip).toEqual(0);
            expect(ph.top).toEqual(10);
        });
    });
    describe("moveLast", () => {

        let p: PagerService;
        let ph: PagingHelper;

        beforeEach(() => {
            p = new PagerService(10);
        });

        it(`For PageSize=10 and TotalItems=0 -> Calling moveLast cause no changes.`, () => {
            expect(p.currentPage).toEqual(0);
            p.moveLast();
            expect(p.currentPage).toEqual(0);
        });
        it(`For PageSize=10 and TotalItems=20 -> Calling moveLast move current page to page 2.`, () => {
            expect(p.currentPage).toEqual(0);
            p.totalItems = 20
            expect(p.currentPage).toEqual(1);
            ph = p.moveLast();
            expect(p.currentPage).toEqual(2);
            expect(ph.page).toEqual(2);
            expect(ph.pages).toEqual(2);
            expect(ph.skip).toEqual(10);
            expect(ph.top).toEqual(10);
        });
    });
    describe("skip", () => {

        let p: PagerService;

        beforeEach(() => {
            p = new PagerService(10);
        });

        it(`For PageSize=10 and TotalItems=0 -> skip is 0`, () => {
            expect(p.skip).toEqual(0);
        });
        it(`For PageSize=10 and TotalItems=35 CurrentPage=1 -> skip is 0`, () => {
            p.totalItems = 35
            expect(p.skip).toEqual(0);
        });
        it(`For PageSize=10 and TotalItems=35 CurrentPage=2 -> skip is 10`, () => {
            p.totalItems = 35
            p.moveNext()
            expect(p.currentPage).toEqual(2);
            expect(p.skip).toEqual(10);
        });
        it(`For PageSize=10 and TotalItems=35 CurrentPage=3-> skip is 20.`, () => {
            p.totalItems = 35
            p.goToPage(3);
            expect(p.skip).toEqual(20);
        });
    });
});

