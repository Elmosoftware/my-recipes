import { TestBed, inject } from '@angular/core/testing';
import { WordAnalyzerService } from "./word-analyzer-service";

describe("WordAnalyzer Class", () => {
    
    let w: WordAnalyzerService;

    beforeEach(function() {
        w = new WordAnalyzerService();
    });
    
    describe("isPunctuationMark()", () => {
        it("Must return 'true' if the parameter is a period, ('.')", () => {
            expect(w.isPunctuationMark(".")).toBe(true);
        });
        it("Must return 'false' if the parameter is a letter, ('a')", () => {
            expect(w.isPunctuationMark("a")).toBe(false);
        });
        it("Must return 'false' if the parameter is a number, ('2')", () => {
            expect(w.isPunctuationMark("2")).toBe(false);
        });
    });
    describe("searchWord()", () => {
        
        let word: string = "word";
        
        it("Must return no matches if the argument 'text' is an empty string", () => {
            expect(w.searchWord("", word)).toEqual([]);
        });
        it("Must return no matches if the argument 'text' is null", () => {
            expect(w.searchWord(null, word)).toEqual([]);
        });
        it("Must return no matches if the argument 'word' is an empty string", () => {
            expect(w.searchWord("sample text", "")).toEqual([]);
        });
        it("Must return no matches if the argument 'word' is null", () => {
            expect(w.searchWord("sample text", null)).toEqual([]);
        });
        it("Must return no matches if the lenght of the argument 'word' is greater than the argument 'text'", () => {
            expect(w.searchWord("1234", "12345")).toEqual([]);
        });
        it("Must return a match if the argument 'text' is the same as the argument 'word'", () => {
            expect(w.searchWord("1234", "1234")).toEqual([0]);
        });
        it(`Single match for '${word}' in text: '${word} at the start.' -> Output: [0]`, () => {
            expect(w.searchWord(`${word} at the start.`, word)).toEqual([0]);
        });
        it(`Single match for '${word}' in text: 'At the end ${word}' -> Output: [11]`, () => {
            expect(w.searchWord(`At the end ${word}`, word)).toEqual([11]);
        });
        it(`No Matches for '${word}' in text: 'A ${word}star is a new cala${word}.' -> Output: []`, () => {
            expect(w.searchWord(`A ${word}star is a new cala${word}.`, word)).toEqual([]);
        });
        it(`No Matches for '${word}' in text: 'A ${word}${word} is a new ${word}${word}${word}.' -> Output: []`, () => {
            expect(w.searchWord(`A ${word}${word} is a new ${word}${word}${word}.`, word)).toEqual([]);
        });
        it(`Multiple Matches on text with spaces for '${word}' in text: 'A ${word} is like a ${word} but when a ${word} is.' -> Output: [2, 17, 33]`, () => {
            expect(w.searchWord(`A ${word} is like a ${word} but when a ${word} is.`, word)).toEqual([2, 17, 33]);
        });
        it(`Multiple Matches on text with other puntuation marks for '${word}' in text: 'A \n${word} is like a .${word} but when is a ${word}star a –)${word} is \'${word}\'.' -> Output: [3, 19, 37, 46]`, () => {
            expect(w.searchWord(`A \n${word} is like a .${word} but when is a ${word}star a –)${word} is \'${word}\'.`, word)).toEqual([3, 19, 51, 60]);
        });
        it(`Case sensitive no match for '${word}' in text: 'A Word is like a worD but when is a WORD is not found.' -> Output: []`, () => {
            expect(w.searchWord("A Word is like a worD but when is a WORD is not found.", word, true)).toEqual([]);
        });
        it(`Case sensitive single match for '${word}' in text: 'A Word is like a ${word} but when is a WORD is not found.' -> Output: [17]`, () => {
            expect(w.searchWord(`A Word is like a ${word} but when is a WORD is not found.`, word, true)).toEqual([17]);
        });
        it(`Case in-sensitive matches for '${word}' in text: 'A WOrd is like a worD but when is a WORD is now found.' -> Output: [2, 17, 36]`, () => {
            expect(w.searchWord("A WOrd is like a worD but when is a WORD is now found.", word)).toEqual([2, 17, 36]);
        });
    });
    describe("searchAndReplaceWord()", () => {
        
        let word: string = "word";
        let newWord: string = "¡abracadabra!";
        
        it("Must return 'text' if 'text' is an empty string", () => {
            expect(w.searchAndReplaceWord("", word, newWord)).toEqual("");
        });
        it("Must return 'text' if 'text' is null", () => {
            expect(w.searchAndReplaceWord(null, word, newWord)).toBe(null);
        });
         it("Must return 'newWord' if 'word' equals 'text'", () => {
            expect(w.searchAndReplaceWord("1234", "1234", newWord)).toEqual(newWord);
        });
        it(`No replacements for '${word}' as '${newWord}' in text: 'A ${word}star is a new cala${word}.' -> Output:'A ${word}star is a new cala${word}.'`, () => {
            expect(w.searchAndReplaceWord(`A ${word}star is a new cala${word}.`, word, newWord)).toEqual(`A ${word}star is a new cala${word}.`);
        });       
        it(`For 'word': '${word}' and 'text': '${word} at the start.', when 'newWord' is ${newWord} -> Output: '${newWord} at the start.'`, () => {
            expect(w.searchAndReplaceWord(`${word} at the start.`, word, newWord)).toEqual(`${newWord} at the start.`);
        });
        it(`For 'word': '${word}' and 'text': 'At the end is the ${word}', when 'newWord' is ${newWord} -> Output: 'At the end is the ${newWord}'`, () => {
            expect(w.searchAndReplaceWord(`At the end is the ${word}`, word, newWord)).toEqual(`At the end is the ${newWord}`);
        });
        it(`For 'word': '${word}' and 'text': 'At the end is the ${word}', when 'newWord' is null -> Output: 'At the end is the '`, () => {
            expect(w.searchAndReplaceWord(`At the end is the ${word}`, word, null)).toEqual(`At the end is the `);
        });        
        it(`For 'word': '${word}' and 'text': 'At the end is the ${word}', when 'newWord' is '' -> Output: 'At the end is the '`, () => {
            expect(w.searchAndReplaceWord(`At the end is the ${word}`, word, "")).toEqual(`At the end is the `);
        });        
    });
});
