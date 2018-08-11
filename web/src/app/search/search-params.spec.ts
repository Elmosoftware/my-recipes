import { TestBed, inject } from '@angular/core/testing';
import { SearchParams } from './search-params';

describe("SearchParams Class", () => {

  let sp: SearchParams;

  describe("term", () => {

    beforeEach(() => {
      sp = new SearchParams();
    });

    it(`When "term" is an empty string, "words" must be an empty array.`, () => {
      expect(Array.isArray(sp.words)).toBe(true);
      expect(sp.words.length).toEqual(0);
    });
    it(`When "term" is "first", "words" must be ["first"].`, () => {
      sp.term = "first";
      expect(sp.words).toEqual(["first"]);
    });
    it(`When "term" is "first second", "words" must be ["first", "second"].`, () => {
      sp.term = "first second";
      expect(sp.words).toEqual(["first", "second"]);
    });
    it(`When "term" is ""first second"", "words" must be ["first second"].`, () => {
      sp.term = "\"first second\"";
      expect(sp.words).toEqual(["first second"]);
    });
    it(`When "term" is ""first second", "words" must be ["first second"].`, () => {
      sp.term = "\"first second";
      expect(sp.words).toEqual(["first second"]);
    });
    it(`When "term" is "first second"", "words" must be ["first second"].`, () => {
      sp.term = "first second\"";
      expect(sp.words).toEqual(["first second"]);
    });
  });
});
