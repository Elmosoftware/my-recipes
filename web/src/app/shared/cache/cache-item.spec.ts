import { TestBed, inject } from '@angular/core/testing';
import { CacheItem } from "./cache-item";

class CacheController {
    constructor() {
        this.value = 0;
    }

    public value: number;

    myRefresh(): Promise<Object> {
        return Promise.resolve(++this.value);
    }
}

describe("CacheItem Class", () => {

    let c: CacheItem;
    let cc: CacheController;

    describe("Initialization values", () => {

        beforeEach(function () {
            c = new CacheItem("init");
        });

        it("Check default initialization values", () => {
            expect(c.key).toEqual("init");
            expect(c.DEFAULT_DURATION).toEqual(60);
            expect(c.isValid).toBe(false);
            expect(c.remainingTime).toEqual(0);
        });
    });
    describe("value", () => {

        beforeEach(function () {
            cc = new CacheController();
            c = new CacheItem("init", 2); //2s duration cache.
            c.setRefreshCallback(cc, cc.myRefresh)
        });

        it("First read", (done) => {
            c.refresh().then(data => {
                c.value = data;
                expect(c.value).toEqual(1);
                done(); //This is to mark the test as done to Jasmine.
            });
        });
    });
    describe("isValid", () => {

        beforeEach(function () {
            cc = new CacheController();
            c = new CacheItem("init", 2); //2s duration cache.
            c.setRefreshCallback(cc, cc.myRefresh)
        });

        it("Cache gets Valid after First read", (done) => {
            expect(c.isValid).toBe(false);
            c.refresh().then(data => {
                c.value = data;
                expect(c.isValid).toBe(true);
                done(); //This is to mark the test as done to Jasmine.
            });
        });
        it("Cache gets invalid after expiration", (done) => {
            //Read of the initial value to force the Cache item duration to start ticking.
            c.refresh().then(data => {
                c.value = data;
            });

            //We now set a timeout to wait one second after the cache expires to check state change:
            setTimeout(() => {
                expect(c.isValid).toBe(false);
                expect(c.remainingTime).toEqual(0);
                done(); //This is to mark the test as done to Jasmine.
            }, (c.duration + 1) * 1000);
        });
    });
    describe("invalidate()", () => {

        beforeEach(function () {
            cc = new CacheController();
            c = new CacheItem("init", 2); //2s duration cache.
            c.setRefreshCallback(cc, cc.myRefresh)
        });

        it("Cache expires when calling to invalidate", (done) => {
            c.refresh().then(data => {
                c.value = data;
                expect(c.isValid).toBe(true);
                c.invalidate();
                expect(c.isValid).toBe(false);
                done(); //This is to mark the test as done to Jasmine.
            });
        });
    });
});
