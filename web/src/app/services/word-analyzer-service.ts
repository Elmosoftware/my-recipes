const DEFAULT_OPTIONS: any = {
    surroundingTextLong: 150,
    caseSensitiveSearch: false,
    preserveTextCasing: true,
    matchesSeparator: "&nbsp;&hellip;",
    maxOcurrences: 0
}

export class WordAnalyzerService {

    /**
     * Those are the punctuation marks used to identify words. A word will be defined as a sequence of caracters 
     * surrounded by no other characters or any of the ones included in this list.
     */
    public punctuationMarks: string[] = [
        " ", //Space
        "\n", //New Line
        "\r", //Carriage return
        "\t", //Tab
        ".", //Period or full stop
        ",", //Comma
        "?", //Question mark
        "¿", //Opening question mark
        "!", //Exclamation mark
        "¡", //Inverted exclamation mark
        "'", //Apostrophe
        "\"", //Quotation mark
        ":", //Colon
        ";", //Semicolon
        "...", //Ellipsis
        "-", //Hyphen
        "–", //n-dash
        "—", //m-dash
        "(", //Open parentheses
        ")" //Close parentheses  
    ];

    constructor() {

    }

    /**
     * Returns a boolean value that indicates if the specified character is a punctuation mark.
     * @param char Character to search the punctuation list.
     */
    public isPunctuationMark(char: string): boolean {
        return (this.punctuationMarks.indexOf(char) != -1)
    }

    /**
     * Returns a number array with all the positions where the word appears in the specified text.
     * @param text Text to seek
     * @param word Word to find
     * @param options This is an object or associative array with the following attributes:
     * 
     *  -*surroundingTextLong*: Numeric value indicating how much at left and right of the word we will include in 
     *      our results per each occurrence of the word. Default value is 150 characters.
     * 
     *  -*caseSensitiveSearch*: Is a boolean value indicating if the word search will be case-sensitive or not. 
     *      Default value is false.
     * 
     *  -*preserveTextCasing*: Indicates if the casing of each appearance of "word" must be keeped as originally 
     *      appears in "text". This parameter will be ignored if *caseSensitiveSearch* is equal to "true".
     *      Default value is true.
     * 
     *  -*matchesSeparator*: Every time we have a positive result we will use this separator to indicate that we are 
     *      showing only the relevant part of the text. Default value is "&nbsp;&hellip;".
     * 
     *  -*maxOcurrences*: Is a numeric value indicating how much results we will show. Default value is 0 which 
     *      indicates that all the matches will be returned.
     */
    public searchWord(text: string, word: string, options: any = DEFAULT_OPTIONS): number[] {
        let ret: boolean;
        let index: number = 0;
        let wordMatch: boolean;
        let matches: number[] = [];

        if (!text || !word || typeof text != "string" || typeof word != "string" || word.length > text.length) {
            return matches;
        }

        this.parseOptions(options);

        if (!options.caseSensitiveSearch) {
            text = text.toLowerCase();
            word = word.toLowerCase();
        }

        index = text.indexOf(word);

        while (index != -1) {

            wordMatch = true;

            //We need to check if the surrounding characters indicates the candidate is the searched word:

            //If there is a character at left and is not a punctuation mark, then is not a word: 
            if (index > 0 && !this.isPunctuationMark(text.charAt(index - 1))) {
                wordMatch = false;
            }

            //We check the same at the right character if any:
            if (wordMatch && index < (text.length - word.length) &&
                !this.isPunctuationMark(text.charAt(index + word.length))) {
                wordMatch = false;
            }

            if (wordMatch) {
                //We have a match!, adding it to our list of matches:
                matches.push(index);
            }

            if (options.maxOcurrences > 0 && matches.length == options.maxOcurrences) {
                index = -1
            }
            else {
                //We continue looking for the word:
                index = text.indexOf(word, index + word.length);
            }
        }

        return matches;
    }

    /**
     * This method returns a new text in which every appearance of the value set for @param word in @param text keeps 
     * the same casing.
     * 
     * *e.g.:*
     * For the following value of word: "HTML", if text is:
     * 
     *      "Html is an hypertext language. html was created by Tim Berners Lee."
     * 
     * The returned value will be:
     * 
     *      "HTML is an hypertext language. HTML was created by Tim Berners Lee."
     *  
     * @param word Word whose casing need to be preserved.
     * @param text text in which to search for "word".
     */
    private preserveWordCasing(word: string, text: string): string{

        let ret: string = text;
        let pos: number = null;

        while (pos != -1) {
        
            pos = ret.toLowerCase().indexOf(word.toLowerCase(), (pos == null) ? 0 : pos + 1 )

            if (pos != -1) {
                ret = ret.slice(0, pos) + word + ret.slice(pos + word.length)
            }
        }

        return ret;
    }

    /**
     * Search and replace every occurrence of one word by another.
     * @param text Text to seek
     * @param word Word to find
     * @param newWord Replacement word
     * @param caseSensitiveSearch "true" if the search must be case-sensitive. By default this value is "false".  
     * @param options This is an object or associative array with the following attributes:
     * 
     *  -*surroundingTextLong*: Numeric value indicating how much at left and right of the word we will include in 
     *      our results per each occurrence of the word. Default value is 150 characters.
     * 
     *  -*caseSensitiveSearch*: Is a boolean value indicating if the word search will be case-sensitive or not. 
     *      Default value is false.
     * 
     *  -*preserveTextCasing*: Indicates if the casing of each appearance of "word" must be keeped as originally 
     *      appears in "text". This parameter will be ignored if *caseSensitiveSearch* is equal to "true".
     *      Default value is true.
     * 
     *  -*matchesSeparator*: Every time we have a positive result we will use this separator to indicate that we are 
     *      showing only the relevant part of the text. Default value is "&nbsp;&hellip;".
     * 
     *  -*maxOcurrences*: Is a numeric value indicating how much results we will show. Default value is 0 which 
     *      indicates that all the matches will be returned.
     */
    public searchAndReplaceWord(text: string, word: string, newWord: string, options: any = DEFAULT_OPTIONS): string {

        let matches: number[];
        let ret: string = "";

        if (!text || typeof text != "string") {
            return text;
        }

        if (typeof newWord != "string") {
            newWord = (newWord == null || newWord == undefined) ? "" : String(newWord);
        }

        this.parseOptions(options);
        matches = this.searchWord(text, word, options);

        matches.forEach((match, i) => {
            let prev: number = (i == 0) ? 0 : matches[i - 1] + word.length;
            let caseNewWord: string = newWord;

            //If we are not doing a case sensitive macth and we need to preserve the casing of the word in the original text:
            if (!options.caseSensitiveSearch && options.preserveTextCasing) {
                caseNewWord = this.preserveWordCasing(text.slice(match, match + word.length), caseNewWord);
            }

            ret += text.slice(prev, match) + caseNewWord;
        });

        ret += text.slice((matches[matches.length - 1] != undefined ? matches[matches.length - 1] + word.length : 0));

        return ret;
    }

    /**
     * What the hell this method is doing? :-)
     * ---------------------------------------
     * 
     * We called "highlighting a word" the action of return an abbreviated text with the searched word in the middle.
     * This is like the way SEO's return the results of a normal search.
     * 
     * e.g: If we search for the word "are" in the text:      
     * 
     *      "Mister Williams apples are tiny and red but very tasty." 
     * 
     * With a value of 15 for "surroundingTextLong". This function must return the text:
     * 
     *      "... apples are tiny and red ..."
     * 
     * Please note that: "surroundingTextLong" is the maximum length of text before and after the word, but we will try 
     * always to do the cut in full words, thats the reason why in this case and with a value of 15 this function
     * will not return:
     * 
     *      "...illiams apples are tiny and red b..."
     * 
     * **Multiple ocurrences**
     * 
     * In the case we have multiple ocurrences for the parameter "word" like in: 
     * 
     *      "Mister Williams apples are tiny and even takes more time than usual to grow. His apples are also very tasty."
     * 
     * The resulting text will be:
     * 
     *      "... apples are tiny and even ... His apples are also very ..."
     * 
     * But if our "text" parameter is now:
     * 
     *      "Mister Williams apples are tiny and they are also red but very tasty."
     * 
     * For the same parameters, our resulting text will be:
     * 
     *      "... apples are tiny and they are also red but ..."
     * 
     * We will detect the overlapping between both surrounding text for the first and second matches and we will 
     * return a largest resultset including both.
     * 
     * @param text Text to seek
     * @param word Word to find
     * @param options This is an object or associative array with the following attributes:
     * 
     *  -*surroundingTextLong*: Numeric value indicating how much at left and right of the word we will include in 
     *      our results per each occurrence of the word. Default value is 150 characters.
     * 
     *  -*caseSensitiveSearch*: Is a boolean value indicating if the word search will be case-sensitive or not. 
     *      Default value is false.
     * 
     *  -*preserveTextCasing*: Indicates if the casing of each appearance of "word" must be keeped as originally 
     *      appears in "text". This parameter will be ignored if *caseSensitiveSearch* is equal to "true".
     *      Default value is true.
     * 
     *  -*matchesSeparator*: Every time we have a positive result we will use this separator to indicate that we are 
     *      showing only the relevant part of the text. Default value is "&nbsp;&hellip;".
     * 
     *  -*maxOcurrences*: Is a numeric value indicating how much results we will show. Default value is 0 which 
     *      indicates that all the matches will be returned.
     */
    public highlightWord(text: string, word: string, options: any = DEFAULT_OPTIONS): string {

        let matches: number[];
        let ret: string = "";
        let overlap: boolean = false;

        if (!text || typeof text != "string") {
            return text;
        }

        this.parseOptions(options);
        matches = this.searchWord(text, word, options);

        for (let i = 0; i < matches.length; i++) {
            let leftSep: string = options.matchesSeparator;
            let rightSep: string = options.matchesSeparator;
            let curr: number = matches[i];
            let next: number = (i + 1 < matches.length) ? matches[i + 1] : -1;

            if (ret.endsWith(options.matchesSeparator) || overlap) {
                leftSep = "";
            }

            //Assembling the portion before the word:
            //---------------------------------------
            //If this occurrence is overlapping the previous, there will be no "left portion", because was already 
            //included as part of the previous iteration:
            if (!overlap) {
                if (curr >= options.surroundingTextLong) {

                    let index: number = this.findFirstPunctuationMark(text.slice(curr - options.surroundingTextLong, curr));

                    ret += leftSep + text.slice(curr - options.surroundingTextLong + index, curr + word.length);
                }
                else {
                    ret += text.slice(0, curr + word.length);
                }
            }

            overlap = next != -1 && next <= curr + word.length + options.surroundingTextLong;

            //Assembling the portion after the word:
            //--------------------------------------
            if (curr + word.length + options.surroundingTextLong < text.length - 1) {
                let stopIndex: number;

                //If the current word will be overlapped with the next one, in this case there will be no separator, and 
                //will be including all the text right after the next occurrence of the word.
                if (overlap) {
                    rightSep = "";
                    stopIndex = next + word.length; //Our stop will be now the end of the next ocurrence of the word.
                }
                else {
                    //If the test is not overlapping with next ocurrence, we will include all the text until the punctuation mark
                    //closest to the surrounding text length.
                    stopIndex = this.findFirstPunctuationMark(text.slice(curr + word.length,
                        curr + word.length + options.surroundingTextLong), true);
                    stopIndex = curr + word.length + stopIndex + 1;
                }

                ret += text.slice(curr + word.length, stopIndex) + rightSep;
            }
            else {
                ret += text.slice(curr + word.length)
            }
        }

        return ret;
    }
    
    /**
     * This method performs the same as combined calls to "searchAndReplaceWord" and "highlightWord".
     * @param text Text to seek
     * @param word Word to find
     * @param newWord Replacement word
     * @param options This is an object or associative array with the following attributes:
     * 
     *  -*surroundingTextLong*: Numeric value indicating how much at left and right of the word we will include in 
     *      our results per each occurrence of the word. Default value is 150 characters.
     * 
     *  -*caseSensitiveSearch*: Is a boolean value indicating if the word search will be case-sensitive or not. 
     *      Default value is false.
     * 
     *  -*preserveTextCasing*: Indicates if the casing of each appearance of "word" must be keeped as originally 
     *      appears in "text". This parameter will be ignored if *caseSensitiveSearch* is equal to "true".
     *      Default value is true.
     * 
     *  -*matchesSeparator*: Every time we have a positive result we will use this separator to indicate that we are 
     *      showing only the relevant part of the text. Default value is "&nbsp;&hellip;".
     * 
     *  -*maxOcurrences*: Is a numeric value indicating how much results we will show. Default value is 0 which 
     *      indicates that all the matches will be returned.
     */
    searchReplaceAndHighlightWord(text: string, word: string, newWord: string, options: any = DEFAULT_OPTIONS): string {

        this.parseOptions(options);
       
        return this.highlightWord(this.searchAndReplaceWord(text, word, newWord, options), newWord, options);
    }

    /**
     * Parse the "options" adding missing members and validating values.
     * @param options Options object to parse.
     */
    private parseOptions(options: any = DEFAULT_OPTIONS): void {

        //If a member is missing we will add it with his default value:
        if (options.surroundingTextLong == undefined) {
            options.surroundingTextLong = DEFAULT_OPTIONS.surroundingTextLong;
        }
        if (options.caseSensitiveSearch == undefined) {
            options.caseSensitiveSearch = DEFAULT_OPTIONS.caseSensitiveSearch;
        }
        if (options.preserveTextCasing == undefined) {
            options.preserveTextCasing = DEFAULT_OPTIONS.preserveTextCasing;
        }
        if (options.matchesSeparator == undefined) {
            options.matchesSeparator = DEFAULT_OPTIONS.matchesSeparator;
        }
        if (options.maxOcurrences == undefined) {
            options.maxOcurrences = DEFAULT_OPTIONS.maxOcurrences;
        }

        //We validate the current value of each member:
        if (typeof options.surroundingTextLong != "number" || options.surroundingTextLong < 0) {
            throw new Error(`The parameter "surroundingTextLong" in the "options" parameter is not a number or have an invalid value. Current value is "${options.surroundingTextLong}"`);
        }

        if (typeof options.caseSensitiveSearch != "boolean") {
            throw new Error(`The parameter "caseSensitiveSearch" in the "options" parameter is not a boolean value. Current value is "${options.caseSensitiveSearch}"`);
        }

        if (typeof options.preserveTextCasing != "boolean") {
            throw new Error(`The parameter "preserveTextCasing" in the "options" parameter is not a boolean value. Current value is "${options.preserveTextCasing}"`);
        }

        if (typeof options.matchesSeparator != "string") {
            throw new Error(`The parameter "matchesSeparator" in the "options" parameter is not a string value. Current value is "${options.matchesSeparator}"`);
        }

        if (typeof options.maxOcurrences != "number" || options.maxOcurrences < 0) {
            throw new Error(`The parameter "maxOcurrences" in the "options" parameter is not a number or have an invalid value. Current value is "${options.maxOcurrences}"`);
        }
    }

    /**
     * Return the index of the first or last punctuation mark on the provided text.
     * @param text Text to search on
     * @param startAtEnd If the search must start at the end of the string. By default search will begin at the first character.
     */
    private findFirstPunctuationMark(text: string, startAtEnd: boolean = false): number {

        let ret: number = 0;
        let chars: string[];

        if (typeof text != "string") {
            throw new Error(`The parameter "text" is not a string value. Current value is "${text}"`);
        }

        chars = text.split("");

        if (startAtEnd) {
            chars.reverse();
        }

        ret = chars.findIndex(char => {
            return this.isPunctuationMark(char);
        })

        if (startAtEnd && ret != -1) {
            ret = chars.length - ret - 1;
        }

        return ret;
    }
}
