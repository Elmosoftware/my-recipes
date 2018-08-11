import { TestBed, inject } from '@angular/core/testing';
import { WordAnalyzerService, SearchWordResults } from "./word-analyzer-service";

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
        let word2: string = "secondword";

        it("SINGLE WORD - Must return no matches if the argument 'text' is an empty string", () => {
            expect(w.searchWord("", word)).toEqual([]);
        });
        it("SINGLE WORD - Must return no matches if the argument 'text' is null", () => {
            expect(w.searchWord(null, word)).toEqual([]);
        });
        it("SINGLE WORD - Must return no matches if the argument 'word' is an empty string", () => {
            expect(w.searchWord("sample text", "")).toEqual([]);
        });
        it("SINGLE WORD - Must return no matches if the argument 'word' is null", () => {
            expect(w.searchWord("sample text", null)).toEqual([]);
        });
        it("SINGLE WORD - Must return no matches if the lenght of the argument 'word' is greater than the argument 'text'", () => {
            expect(w.searchWord("1234", "12345")).toEqual([]);
        });
        it("SINGLE WORD - Must return a match if the argument 'text' is the same as the argument 'word'", () => {
            expect(w.searchWord("1234", "1234")).toEqual([new SearchWordResults("1234", 0)]);
        });
        it(`SINGLE WORD - Single match for '${word}' in text: '${word} at the start.' -> Output: [{ word:'${word}', position:0 }]`, () => {
            expect(w.searchWord(`${word} at the start.`, word)).toEqual([new SearchWordResults(word, 0)]);
        });
        it(`SINGLE WORD - Single match for '${word}' in text: 'At the end ${word}' -> Output: [{ word:'${word}', position:11 }]`, () => {
            expect(w.searchWord(`At the end ${word}`, word)).toEqual([new SearchWordResults(word, 11)]);
        });
        it(`SINGLE WORD - No Matches for '${word}' in text: 'A ${word}star is a new cala${word}.' -> Output: []`, () => {
            expect(w.searchWord(`A ${word}star is a new cala${word}.`, word)).toEqual([]);
        });
        it(`SINGLE WORD - No Matches for '${word}' in text: 'A ${word}${word} is a new ${word}${word}${word}.' -> Output: []`, () => {
            expect(w.searchWord(`A ${word}${word} is a new ${word}${word}${word}.`, word)).toEqual([]);
        });
        it(`SINGLE WORD - Multiple Matches on text with spaces for '${word}' in text: 'A ${word} is like a ${word} but when a ${word} is.' -> Output: [{ word:'${word}', position:2 }, { word:'${word}', position:17 }, { word:'${word}', position:33 }]`, () => {
            expect(w.searchWord(`A ${word} is like a ${word} but when a ${word} is.`, word)).toEqual(
                [new SearchWordResults(word, 2), new SearchWordResults(word, 17), new SearchWordResults(word, 33)]);
        });
        it(`SINGLE WORD - Multiple Matches on text with other puntuation marks for '${word}' in text: 'A \n${word} is like a .${word} but when is a ${word}star a –)${word} is \'${word}\'.' -> Output: [{ word:'${word}', position:3 }, { word:'${word}', position:19 }, { word:'${word}', position:51 }, { word:'${word}', position:60 }]`, () => {
            expect(w.searchWord(`A \n${word} is like a .${word} but when is a ${word}star a –)${word} is \'${word}\'.`, word))
                .toEqual([new SearchWordResults(word, 3), new SearchWordResults(word, 19),
                new SearchWordResults(word, 51), new SearchWordResults(word, 60)]);
        });
        it(`SINGLE WORD - Case sensitive no match for '${word}' in text: 'A Word is like a worD but when is a WORD is not found.' -> Output: []`, () => {
            expect(w.searchWord("A Word is like a worD but when is a WORD is not found.", word,
                { caseSensitiveSearch: true })).toEqual([]);
        });
        it(`SINGLE WORD - Case sensitive single match for '${word}' in text: 'A Word is like a ${word} but when is a WORD is not found.' -> Output: [{ word:'${word}', position:17 }]`, () => {
            expect(w.searchWord(`A Word is like a ${word} but when is a WORD is not found.`, word,
                { caseSensitiveSearch: true }))
                .toEqual([new SearchWordResults(word, 17)]);
        });
        it(`SINGLE WORD - Case in-sensitive matches for '${word}' in text: 'A WOrd is like a worD but when is a WORD is now found.' -> Output: [{ word:'${word}', position:2 }, { word:'${word}', position:17 }, { word:'${word}', position:36 }]`, () => {
            expect(w.searchWord("A WOrd is like a worD but when is a WORD is now found.", word))
                .toEqual([new SearchWordResults(word, 2), new SearchWordResults(word, 17),
                new SearchWordResults(word, 36)]);
        });
        it(`SINGLE WORD - Case in-sensitive matches for '${word.toUpperCase()}' in text: 'A WOrd is like a worD but when is a WORD is now found.' -> Output: [{ word:'${word.toUpperCase()}', position:2 }, { word:'${word.toUpperCase()}', position:17 }, { word:'${word.toUpperCase()}', position:36 }]`, () => {
            expect(w.searchWord("A WOrd is like a worD but when is a WORD is now found.", word.toUpperCase()))
                .toEqual([new SearchWordResults(word.toUpperCase(), 2), new SearchWordResults(word.toUpperCase(), 17),
                new SearchWordResults(word.toUpperCase(), 36)]);
        });
        it(`SINGLE WORD - Max Ocurrences set to "0" for a text with 3 ocurrences for '${word}' in text: 'A ${word} is like a ${word} but when is a ${word} is now found.' -> Output: [{ word:'${word}', position:2 }, { word:'${word}', position:17 }, { word:'${word}', position:36 }]`, () => {
            expect(w.searchWord("A WOrd is like a worD but when is a WORD is now found.", word,
                { maxOcurrences: 0 }))
                .toEqual([new SearchWordResults(word, 2), new SearchWordResults(word, 17), new SearchWordResults(word, 36)]);
        });
        it(`SINGLE WORD - Max Ocurrences set to "2" for a text with 3 ocurrences for '${word}' in text: 'A ${word} is like a ${word} but when is a ${word} is now found.' -> Output: [{ word:'${word}', position:2 }, { word:'${word}', position:17 }]`, () => {
            expect(w.searchWord("A WOrd is like a worD but when is a WORD is now found.", word,
                { maxOcurrences: 2 }))
                .toEqual([new SearchWordResults(word, 2), new SearchWordResults(word, 17)]);
        });
        it(`MULTIPLE WORDS - Single match for ['${word}', '${word2}'] in text: 'This is a ${word} in the middle.' -> Output: [{ word:'${word}', position:10 }]`, () => {
            expect(w.searchWord(`This is a ${word} in the middle.`, [word, word2])).toEqual([new SearchWordResults(word, 10)]);
        });
        it(`MULTIPLE WORDS - Multiple matches for ['${word}', '${word2}'] in text: 'This is ${word2} and ${word} in a same sentence. And repeating here: ${word}, ${word2}.' -> Output: [{ word:'${word2}', position:8 }, { word:'${word}', position:23 }, { word:'${word}', position:68 }, { word:'${word2}', position:74 }]`, () => {
            expect(w.searchWord(`This is ${word2} and ${word} in a same sentence. And repeating here: ${word}, ${word2}.`, [word, word2]))
                .toEqual([
                    new SearchWordResults(word2, 8), new SearchWordResults(word, 23),
                    new SearchWordResults(word, 68), new SearchWordResults(word2, 74)]);
        });
        it(`MULTIPLE WORDS - Max Ocurrences set to "1" for a text with 2 ocurrences for ['${word}', '${word2}'] in text: 'This is ${word2} and ${word} in a same sentence. And repeating here: ${word}, ${word2}.' -> Output: [{ word:'${word2}', position:8 }, { word:'${word}', position:23 }]`, () => {
            expect(w.searchWord(`This is ${word2} and ${word} in a same sentence. And repeating here: ${word}, ${word2}.`, [word, word2],
                { maxOcurrences: 1 }))
                .toEqual([new SearchWordResults(word2, 8), new SearchWordResults(word, 23)]);
        });
    });
    describe("searchAndReplaceWord()", () => {

        let word1: string = "word";
        let newWord1: string = "¡abracadabra!";
        let word2: string = "wordtwo";
        let newWord2: string = "Wingardium Leviosa!";
        let OneWord: Map<string, string> = new Map([[word1, newWord1]]);
        let TwoWords: Map<string, string> = new Map([[word1, newWord1], [word2, newWord2]]);

        it("Must return 'text' if 'text' is an empty string", () => {
            expect(w.searchAndReplaceWord("", OneWord))
                .toEqual("");
        });
        it("Must return 'text' if 'text' is null", () => {
            expect(w.searchAndReplaceWord(null, OneWord))
                .toBe(null);
        });
        it("Must return 'newWord' if 'word' equals 'text'", () => {
            expect(w.searchAndReplaceWord("1234", new Map([["1234", newWord1]])))
                .toEqual(newWord1);
        });
        it(`No replacements for '${word1}' as '${newWord1}' in text: 'A ${word1}star is a new cala${word1}.' -> Output:'A ${word1}star is a new cala${word1}.'`, () => {
            expect(w.searchAndReplaceWord(`A ${word1}star is a new cala${word1}.`, OneWord))
                .toEqual(`A ${word1}star is a new cala${word1}.`);
        });
        it(`For 'word': '${word1}' and 'text': '${word1} at the start.', when 'newWord' is ${newWord1} -> Output: '${newWord1} at the start.'`, () => {
            expect(w.searchAndReplaceWord(`${word1} at the start.`, OneWord))
                .toEqual(`${newWord1} at the start.`);
        });
        it(`For 'word': '${word1}' and 'text': 'At the end is the ${word1}', when 'newWord' is ${newWord1} -> Output: 'At the end is the ${newWord1}'`, () => {
            expect(w.searchAndReplaceWord(`At the end is the ${word1}`, OneWord))
                .toEqual(`At the end is the ${newWord1}`);
        });
        it(`For 'word': '${word1}' and 'text': 'At the end is the ${word1}', when 'newWord' is null -> Output: 'At the end is the '`, () => {
            expect(w.searchAndReplaceWord(`At the end is the ${word1}`, new Map([[word1, null]])))
                .toEqual(`At the end is the `);
        });
        it(`For 'word': '${word1}' and 'text': 'At the end is the ${word1}', when 'newWord' is '' -> Output: 'At the end is the '`, () => {
            expect(w.searchAndReplaceWord(`At the end is the ${word1}`, new Map([[word1, ""]])))
                .toEqual(`At the end is the `);
        });
        it(`Preserve original casing, (single repetition in "newWord") - When 'word': '${word1}' and 'text': 'At the end is the WORD', when 'newWord' is '${"(replace" + word1 + ")"}' -> Output: 'At the end is the (replaceWORD)'`, () => {
            expect(w.searchAndReplaceWord(`At the end is the WORD`, new Map([[word1, "(replace" + word1 + ")"]])))
                .toEqual(`At the end is the (replaceWORD)`);
        });
        it(`Preserve original casing, (multiple repetition in "newWord") - When 'word': '${word1}' and 'text': 'At the end is the WORD', when 'newWord' is "(replacewordreplaceword)"' -> Output: 'At the end is the (replaceWorDreplaceWorD)'`, () => {
            expect(w.searchAndReplaceWord(`At the end is the WorD`, new Map([[word1, "(replacewordreplaceword)"]])))
                .toEqual(`At the end is the (replaceWorDreplaceWorD)`);
        });
        it(`Preserve original casing, (multiple repetition in "word" and "newWord") - When 'word': '${word1}' and 'text': 'There is a woRD and then at the end is another WORD', when 'newWord' is "(replacewordreplaceword)"' -> Output: 'There is a (replacewoRDreplacewoRD) and then at the end is another (replaceWORDreplaceWORD)'`, () => {
            expect(w.searchAndReplaceWord(`There is a woRD and then at the end is another WORD`, new Map([[word1, "(replacewordreplaceword)"]])))
                .toEqual(`There is a (replacewoRDreplacewoRD) and then at the end is another (replaceWORDreplaceWORD)`);
        });
        it(`MULTIPLE WORDS - For [['${word1}', '${newWord1}'],['${word2}', '${newWord2}']] in text: 'This is ${word1} and ${word2} in a same sentence.' -> Output: 'This is ${newWord1} and ${newWord2} in a same sentence.'`, () => {
            expect(w.searchAndReplaceWord(`This is ${word1} and ${word2} in a same sentence.`, TwoWords))
                .toEqual(`This is ${newWord1} and ${newWord2} in a same sentence.`);
        });
        it(`MULTIPLE WORDS - Multiple Matches For [['${word1}', '${newWord1}'],['${word2}', '${newWord2}']] in text: 'This is ${word1} and ${word2} in a same sentence. Repeating ${word1},${word1} twice and following ${word2}? ${word2}.${word2} three time now.' -> Output: 'This is ${newWord1} and ${newWord2} in a same sentence. Repeating ${newWord1},${newWord1} twice and following ${newWord2}? ${newWord2}.${newWord2} three time now.'`, () => {
            expect(w.searchAndReplaceWord(`This is ${word1} and ${word2} in a same sentence. Repeating ${word1},${word1} twice and following ${word2}? ${word2}.${word2} three time now.`,
                TwoWords))
                .toEqual(`This is ${newWord1} and ${newWord2} in a same sentence. Repeating ${newWord1},${newWord1} twice and following ${newWord2}? ${newWord2}.${newWord2} three time now.`);
        });
    });
    describe("wordHighlighter()", () => {

        let text: string = "";
        let word: string = ""
        let word2: string = ""
        let words: string[];
        let options: any = {}

        beforeEach(() => {
            word = "WORD"
            word2 = "WORD2"
            words = [word, word2];
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
            expect(w.highlightWord(text, word, options)).toEqual(text);
        });
        it("No ocurrences - Empty text and empty word", () => {
            text = ``
            word = ``
            expect(w.highlightWord(text, word, options)).toEqual(``);
        });
        it("Single Word, Single ocurrence - Word at the begining of text", () => {
            text =
                `${word} A wet brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${word} A wet brown dog ${options.matchesSeparator}`);
        });
        it("Single Word, Single ocurrence - Word at the end of text", () => {
            text =
                `A wet brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little ${word}.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${options.matchesSeparator} flushed a little ${word}.`);
        });
        it("Single Word, Single ocurrence - Word at the middle of text", () => {
            text =
                `A wet brown dog came running and did not bark, lifting a wet feather of a tail. ${word} The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${options.matchesSeparator} feather of a tail. ${word} The man followed ${options.matchesSeparator}`);
        });
        it("Single Word, Single ocurrence - Word at the begining with a word longer than 'options.surroundingTextLong' at right", () => {
            text =
                `${word} Averylongwordthattakesmorethanthesurroundingtextseparation wet brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${word} ${options.matchesSeparator}`);
        });
        it("Single Word, Single ocurrence - Word at the end of text with a word longer than 'options.surroundingTextLong' at left", () => {
            text =
                `A wet brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little Averylongwordthattakesmorethanthesurroundingtextseparation ${word}.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${options.matchesSeparator} ${word}.`);
        });
        it("Single Word, Single ocurrence - Word at the middle of text with a word longer than 'options.surroundingTextLong' at both sides", () => {
            text =
                `A wet brown dog came running and did not bark, lifting a wet feather of a tail. Averylongwordthattakesmorethanthesurroundingtextseparation ${word} Averylongwordthattakesmorethanthesurroundingtextseparation The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `${options.matchesSeparator} ${word} ${options.matchesSeparator}`);
        });
        it("Single Word, Multiple ocurrences - No overlapping", () => {
            text =
                `A wet ${word} brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, ${word} and face flushed a little. 
She felt him recoil in his quick walk, when he saw her. She stood up in the handbreadth of ${word} dryness under 
the rustic porch. He saluted without speaking, coming slowly near. ${word} She began to withdraw.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `A wet ${word} brown dog came ${options.matchesSeparator}, like a chauffeur, ${word} and face flushed a ${options.matchesSeparator} the handbreadth of ${word} dryness under 
the ${options.matchesSeparator} slowly near. ${word} She began to ${options.matchesSeparator}`);
        });
        it("Single Word, Multiple ocurrences - With overlapping - 2 Overlapped occurrences", () => {
            text =
                `A wet ${word} brown dog came ${word} running and did not bark, lifting a wet feather of a tail.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `A wet ${word} brown dog came ${word} running and did ${options.matchesSeparator}`);
        });
        it("Single Word, Multiple ocurrences - With overlapping - 3 Overlapped occurrences", () => {
            text =
                `A wet ${word} brown dog came ${word} running and did ${word} not bark, lifting a wet feather of a tail.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `A wet ${word} brown dog came ${word} running and did ${word} not bark, lifting ${options.matchesSeparator}`);
        });
        it("Single Word, Multiple ocurrences - With overlapping - 3 Overlapped occurrences last at the end", () => {
            text =
                `A wet ${word} brown dog came ${word} running and did ${word}`
            expect(w.highlightWord(text, word, options)).toEqual(
                `A wet ${word} brown dog came ${word} running and did ${word}`);
        });
        it("Single Word, Multiple ocurrences - With overlapping - 4 ocurrences: 2 Overlapped + 2 Not overlapped", () => {
            text =
                `A wet ${word} brown dog came running and did not bark, lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little. 
She felt him ${word} recoil in his ${word} quick walk, when he saw her. She stood up in the handbreadth of dryness under 
the rustic porch. He saluted without speaking, coming slowly near. ${word} She began to withdraw.`
            expect(w.highlightWord(text, word, options)).toEqual(
                `A wet ${word} brown dog came ${options.matchesSeparator}. 
She felt him ${word} recoil in his ${word} quick walk, when ${options.matchesSeparator} slowly near. ${word} She began to ${options.matchesSeparator}`);
        });
        it("Multiple Words, Single ocurrence each - No overlapping", () => {
            text =
                `A wet brown dog came running and did not bark, ${word} lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like a chauffeur, and face flushed a little. 
She felt him recoil in his ${word2} quick walk, when he saw her. She stood up in the handbreadth of dryness under 
the rustic porch. He saluted without speaking, coming slowly near. She began to withdraw.`
            expect(w.highlightWord(text, words, options)).toEqual(
                `${options.matchesSeparator} and did not bark, ${word} lifting a wet ${options.matchesSeparator} him recoil in his ${word2} quick walk, when ${options.matchesSeparator}`);
        });
        it("Multiple Words, Multiple ocurrence each - No overlapping", () => {
            text =
                `A wet brown dog came running and did not bark, ${word} lifting a wet feather of a tail. The man followed in a wet 
black oilskin jacket, like ${word} a chauffeur, and face flushed a little. 
She felt him recoil in his ${word2} quick walk, when he saw her. She stood up in the handbreadth of dryness under 
the rustic porch. He saluted without speaking, coming slowly near. She began to ${word2} withdraw.`
            expect(w.highlightWord(text, words, options)).toEqual(
                `${options.matchesSeparator} and did not bark, ${word} lifting a wet ${options.matchesSeparator} jacket, like ${word} a chauffeur, and ${options.matchesSeparator} him recoil in his ${word2} quick walk, when ${options.matchesSeparator} near. She began to ${word2} withdraw.`);
        });
        it("Multiple Words, Multiple ocurrence each - With overlapping", () => {
            text =
                `A wet brown dog came running and did not bark, ${word} lifting a wet ${word} feather of a tail. The man followed in a wet 
black oilskin jacket, like  a chauffeur, and face flushed a little. 
She felt ${word2} him recoil in his ${word2} quick walk, when he saw her. She stood up in the handbreadth of dryness under 
the rustic porch. He saluted without speaking, coming slowly near. She began to  withdraw.`
            expect(w.highlightWord(text, words, options)).toEqual(
                `${options.matchesSeparator} and did not bark, ${word} lifting a wet ${word} feather of a tail. ${options.matchesSeparator} little. 
She felt ${word2} him recoil in his ${word2} quick walk, when ${options.matchesSeparator}`);
        });
    });
});
