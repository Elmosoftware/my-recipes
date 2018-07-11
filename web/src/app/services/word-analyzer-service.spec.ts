import { TestBed, inject } from '@angular/core/testing';
import { WordAnalyzerService } from "./word-analyzer-service";

describe("WordAnalyzer Class", () => {

    let w: WordAnalyzerService;

    beforeEach(function () {
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
            expect(w.searchWord("A Word is like a worD but when is a WORD is not found.", word,
                { caseSensitiveSearch: true })).toEqual([]);
        });
        it(`Case sensitive single match for '${word}' in text: 'A Word is like a ${word} but when is a WORD is not found.' -> Output: [17]`, () => {
            expect(w.searchWord(`A Word is like a ${word} but when is a WORD is not found.`, word, 
                { caseSensitiveSearch: true })).toEqual([17]);
        });
        it(`Case in-sensitive matches for '${word}' in text: 'A WOrd is like a worD but when is a WORD is now found.' -> Output: [2, 17, 36]`, () => {
            expect(w.searchWord("A WOrd is like a worD but when is a WORD is now found.", word)).toEqual([2, 17, 36]);
        });
        it(`Max Ocurrences set to "0" for a text with 3 ocurrences for '${word}' in text: 'A ${word} is like a ${word} but when is a ${word} is now found.' -> Output: [2, 17, 36]`, () => {
            expect(w.searchWord("A WOrd is like a worD but when is a WORD is now found.", word, 
                { maxOcurrences: 0 })).toEqual([2, 17, 36]);
        });
        it(`Max Ocurrences set to "2" for a text with 3 ocurrences for '${word}' in text: 'A ${word} is like a ${word} but when is a ${word} is now found.' -> Output: [2, 17]`, () => {
            expect(w.searchWord("A WOrd is like a worD but when is a WORD is now found.", word, 
                { maxOcurrences: 2 })).toEqual([2, 17]);
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
        it(`Preserve original casing, (single repetition in "newWord") - When 'word': '${word}' and 'text': 'At the end is the WORD', when 'newWord' is '${"(replace" + word + ")"}' -> Output: 'At the end is the (replaceWORD)'`, () => {
            expect(w.searchAndReplaceWord(`At the end is the WORD`, word, "(replace" + word + ")")).
                toEqual(`At the end is the (replaceWORD)`);
        });
        it(`Preserve original casing, (multiple repetition in "newWord") - When 'word': '${word}' and 'text': 'At the end is the WORD', when 'newWord' is "(replacewordreplaceword)"' -> Output: 'At the end is the (replaceWorDreplaceWorD)'`, () => {
            expect(w.searchAndReplaceWord(`At the end is the WorD`, word, "(replacewordreplaceword)")).
                toEqual(`At the end is the (replaceWorDreplaceWorD)`);
        });
        it(`Preserve original casing, (multiple repetition in "word" and "newWord") - When 'word': '${word}' and 'text': 'There is a woRD and then at the end is another WORD', when 'newWord' is "(replacewordreplaceword)"' -> Output: 'There is a (replacewoRDreplacewoRD) and then at the end is another (replaceWORDreplaceWORD)'`, () => {
            expect(w.searchAndReplaceWord(`There is a woRD and then at the end is another WORD`, word, "(replacewordreplaceword)")).
                toEqual(`There is a (replacewoRDreplacewoRD) and then at the end is another (replaceWORDreplaceWORD)`);
        });
    });
    describe("wordHighlighter()", () => {

        let text: string = "";
        let word: string = ""
        let options: any = {}

        beforeEach(() => {
            word = "WORD"
            text =
                `A wet ${word} brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, ${word} and face flushed a little.
She felt him recoil in his quick walk, when he saw her. She stood up in the handbreadth of ${word} dryness under 
the rustic porch. He saluted without speaking, coming slowly near. She began to ${word} withdraw.`
            options = {
                surroundingTextLong: 20,
                matchesSeparator: "&nbsp;&hellip;",
                maxOcurrences: 0
            }
        })

        it("Must throw an error if parameter 'options.surroundingTextLong' is not a number", () => {
            expect(() => { w.highlightWord(text, word, { surroundingTextLong: false }) })
                .toThrowError(`The parameter "surroundingTextLong" in the "options" parameter is not a number or have an invalid value. Current value is "${false}"`)
        });
        it("Must throw an error if parameter 'options.surroundingTextLong' is a negative number", () => {
            expect(() => { w.highlightWord(text, word, { surroundingTextLong: -1 }) })
                .toThrowError(`The parameter "surroundingTextLong" in the "options" parameter is not a number or have an invalid value. Current value is "${-1}"`)
        });
        it("Must throw an error if parameter 'options.caseSensitiveSearch' is not a boolean", () => {
            expect(() => { w.highlightWord(text, word, { caseSensitiveSearch: 34 }) })
                .toThrowError(`The parameter "caseSensitiveSearch" in the "options" parameter is not a boolean value. Current value is "${34}"`)
        });
        it("Must throw an error if parameter 'options.matchesSeparator' is not a string", () => {
            expect(() => { w.highlightWord(text, word, { matchesSeparator: 34 }) })
                .toThrowError(`The parameter "matchesSeparator" in the "options" parameter is not a string value. Current value is "${34}"`)
        });
        it("Must throw an error if parameter 'options.maxOcurrences' is not a number", () => {
            expect(() => { w.highlightWord(text, word, { maxOcurrences: false }) })
                .toThrowError(`The parameter "maxOcurrences" in the "options" parameter is not a number or have an invalid value. Current value is "${false}"`)
        });
        it("Must throw an error if parameter 'options.maxOcurrences' is a negative number", () => {
            expect(() => { w.highlightWord(text, word, { maxOcurrences: -1 }) })
                .toThrowError(`The parameter "maxOcurrences" in the "options" parameter is not a number or have an invalid value. Current value is "${-1}"`)
        });
        it("No ocurrences - Non empty text", () => {
            text =
                `A wet brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little.`
            expect(w.highlightWord(text, word, options)).toEqual(``);
        });
        it("No ocurrences - Empty text", () => {
            text = ``
            expect(w.highlightWord(text, word, options)).toEqual(``);
        });
        it("No ocurrences - Non empty text but empty word", () => {
            text =
                `A wet brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little.`
            word = ``
            expect(w.highlightWord(text, word, options)).toEqual(``);
        });
        it("No ocurrences - Empty text and empty word", () => {
            text = ``
            word = ``
            expect(w.highlightWord(text, word, options)).toEqual(``);
        });
        it("Single ocurrence - Word at the begining of text", () => {
            text =
                `${word} A wet brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${word} A wet brown dog ${options.matchesSeparator}`);
        });
        it("Single ocurrence - Word at the end of text", () => {
            text =
                `A wet brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little ${word}.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${options.matchesSeparator} flushed a little ${word}.`);
        });
        it("Single ocurrence - Word at the middle of text", () => {
            text =
                `A wet brown dog came running and did not bark, lifting a wet feather of a tail. ${word} The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${options.matchesSeparator} feather of a tail. ${word} The man followed ${options.matchesSeparator}`);
        });
        it("Single ocurrence - Word at the begining with a word longer than 'options.surroundingTextLong' at right", () => {
            text =
                `${word} Averylongwordthattakesmorethanthesurroundingtextseparation wet brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${word} ${options.matchesSeparator}`);
        });
        it("Single ocurrence - Word at the end of text with a word longer than 'options.surroundingTextLong' at left", () => {
            text =
                `A wet brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little Averylongwordthattakesmorethanthesurroundingtextseparation ${word}.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${options.matchesSeparator} ${word}.`);
        });
        it("Single ocurrence - Word at the middle of text with a word longer than 'options.surroundingTextLong' at both sides", () => {
            text =
                `A wet brown dog came running and did not bark, lifting a wet feather of a tail. Averylongwordthattakesmorethanthesurroundingtextseparation ${word} Averylongwordthattakesmorethanthesurroundingtextseparation The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${options.matchesSeparator} ${word} ${options.matchesSeparator}`);
        });
        it("Multiple ocurrences - No overlapping", () => {
            text =
                `A wet ${word} brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, ${word} and face flushed a little. 
She felt him recoil in his quick walk, when he saw her. She stood up in the handbreadth of ${word} dryness under 
the rustic porch. He saluted without speaking, coming slowly near. ${word} She began to withdraw.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `A wet ${word} brown dog came ${options.matchesSeparator}, like a chauffeur, ${word} and face flushed a ${options.matchesSeparator} the handbreadth of ${word} dryness under 
the ${options.matchesSeparator} slowly near. ${word} She began to ${options.matchesSeparator}`);
        });
        it("Multiple ocurrences - With overlapping - 2 Overlapped occurrences", () => {
            text =
                `A wet ${word} brown dog came ${word} running and did not bark, lifting a wet feather of a tail.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `A wet ${word} brown dog came ${word} running and did ${options.matchesSeparator}`);
        });
        it("Multiple ocurrences - With overlapping - 3 Overlapped occurrences", () => {
            text =
                `A wet ${word} brown dog came ${word} running and did ${word} not bark, lifting a wet feather of a tail.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `A wet ${word} brown dog came ${word} running and did ${word} not bark, lifting ${options.matchesSeparator}`);
        });
        it("Multiple ocurrences - With overlapping - 3 Overlapped occurrences last at the end", () => {
            text =
                `A wet ${word} brown dog came ${word} running and did ${word}`
            expect(w.highlightWord(text, word, options)).toEqual(
                `A wet ${word} brown dog came ${word} running and did ${word}`);
        });
        it("Multiple ocurrences - With overlapping - 4 ocurrences: 2 Overlapped + 2 Not overlapped", () => {
            text =
                `A wet ${word} brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little. 
She felt him ${word} recoil in his ${word} quick walk, when he saw her. She stood up in the handbreadth of dryness under 
the rustic porch. He saluted without speaking, coming slowly near. ${word} She began to withdraw.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `A wet ${word} brown dog came ${options.matchesSeparator}. 
She felt him ${word} recoil in his ${word} quick walk, when ${options.matchesSeparator} slowly near. ${word} She began to ${options.matchesSeparator}`);
        });
    });
});
