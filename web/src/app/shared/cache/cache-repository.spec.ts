import { TestBed, inject } from '@angular/core/testing';
import { CacheItem } from "./cache-item";
import { CacheRepository } from "./cache-repository";

class CacheController {
    constructor() {
        this.value = 0;
    }

    public value: number;

    myRefresh(): Promise<Object> {
        return Promise.resolve(++this.value);
    }
}

describe("CacheRepository Class", () => {

    let c: CacheRepository;
    
    beforeEach(function () {
        c = new CacheRepository();
    });
    
    describe("add()", () => {
        it("Adding and retrieving a CacheItem", () => {

            let ci = new CacheItem("key");
            
            expect(c.count).toEqual(0);
            c.add(ci);
            expect(c.count).toEqual(1);
            expect(c.get(ci.key)).toBe(ci);
            
        });
    });
    describe("remove()", () => {
        it("Removing a CacheItem", () => {

            let ci = new CacheItem("key");
            
            c.add(ci);
            expect(c.remove("key")).toBe(ci);
            expect(c.count).toEqual(0);            
        });
    });
    describe("invalidate()", () => {

        let cc: CacheController;

        beforeEach(function () {
            cc = new CacheController();
        });

        it("Invalidate the Cache Items in pool", (done) => {

            let ci1 = new CacheItem("key1");
            let ci2 = new CacheItem("key2");

            ci1.setRefreshCallback(cc, cc.myRefresh);
            ci2.setRefreshCallback(cc, cc.myRefresh);
            c.add(ci1);
            c.add(ci2);

            ci1.refresh().then(data => {
                ci1.value = data;
            });
            ci2.refresh().then(data => {
                ci2.value = data;
            });

            setTimeout(() => {
                expect(c.get("key1").isValid).toBe(true);
                expect(c.get("key2").isValid).toBe(true);
                c.invalidate();
                expect(c.get("key1").isValid).toBe(false);
                expect(c.get("key2").isValid).toBe(false);
                
                done(); //This is to mark the test as done to Jasmine.
            }, 10);
        });
    });
});
