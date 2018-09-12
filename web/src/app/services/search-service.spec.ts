import { TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';

import { SearchService, SEARCH_TYPE } from './search-service';

describe("SearchService Class", () => {

  let router: Router;
  let ss: SearchService; 

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } }]
    });

    router = TestBed.get(Router);
    ss = new SearchService(router)
  });

  describe("term", () => {
    it(`When "term" is an empty string, "words" must be an empty array.`, () => {
      expect(Array.isArray(ss.words)).toBe(true);
      expect(ss.words.length).toEqual(0);
    });
    it(`When "term" is "first", "words" must be ["first"].`, () => {
      ss.term = "first";
      expect(ss.words).toEqual(["first"]);
    });
    it(`When "term" is "first second", "words" must be ["first", "second"].`, () => {
      ss.term = "first second";
      expect(ss.words).toEqual(["first", "second"]);
    });
    it(`When "term" is ""first second"", "words" must be ["first second"].`, () => {
      ss.term = "\"first second\"";
      expect(ss.words).toEqual(["first second"]);
    });
    it(`When "term" is ""first second", "words" must be ["first second"].`, () => {
      ss.term = "\"first second";
      expect(ss.words).toEqual(["first second"]);
    });
    it(`When "term" is "first second"", "words" must be ["first second"].`, () => {
      ss.term = "first second\"";
      expect(ss.words).toEqual(["first second"]);
    });    
  });
  describe("search()", () => {
    it(`For SEARCH_TYPE "Text" it must throw an error if the search term is not valid.`, () => {
      ss.term = "a";

      expect(() => { ss.search(); })
        .toThrowError(`The search term is not valid. The search operation will be aborted.`);
    });    
    it(`For SEARCH_TYPE "Text" it navigates successfully to search page when the search term is valid.`, () => {
      ss.term = "my search";
      ss.search();
      
      expect(router.navigate).toHaveBeenCalledWith(['/search'], 
        { queryParams: { type: "text", term: "my search", id: "" }});
    });    
    it(`For SEARCH_TYPE "Ingredient" it must throw an error if the search term is not valid.`, () => {
      ss.searchType = SEARCH_TYPE.Ingredient;
      ss.term = "Ingredient name";
      ss.id = ""

      expect(() => { ss.search(); })
        .toThrowError(`The search term is not valid. The search operation will be aborted.`);
    });    
    it(`For SEARCH_TYPE "Ingredient" it navigates successfully to search page when the search term is valid.`, () => {
      ss.searchType = SEARCH_TYPE.Ingredient;
      ss.term = "Ingredient name";
      ss.id = "xxx"
      ss.search();
      
      expect(router.navigate).toHaveBeenCalledWith(['/search'], 
        { queryParams: { type: "ingredient", term: "Ingredient name", id: "xxx" }});
    });   
  });
});
