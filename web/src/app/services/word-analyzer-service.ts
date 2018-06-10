

export class WordAnalyzerService {

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

    public isPunctuationMark(char: string): boolean {
        return (this.punctuationMarks.indexOf(char) != -1)
    }

    public searchWord(text: string, word: string, caseSensitiveSearch: boolean = false): number[] {
        let ret: boolean;
        let index: number = 0;
        let wordMatch: boolean;
        let matches: number[] = [];

        if (!text || !word || typeof text != "string" || typeof word != "string" || word.length > text.length) {
            return matches;
        }

        if (!caseSensitiveSearch) {
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

            //We continue looking for the word:
            index = text.indexOf(word, index + word.length);
        }

        return matches;
    }

    public searchAndReplaceWord(text: string, word: string, newWord: string, caseSensitiveSearch: boolean = false): string {

        let matches: number[];
        let ret: string = "";

        if (!text || typeof text != "string") {
            return text;
        }
        
        if (typeof newWord != "string") {
            newWord = (newWord == null || newWord == undefined) ? "" : String(newWord);
        }

        matches = this.searchWord(text, word, caseSensitiveSearch);

        matches.forEach((match, i) => {
            let prev: number = (i == 0) ? 0 : matches[i - 1] + word.length;
            ret += text.slice(prev, match) + newWord;
        });

        ret += text.slice((matches[matches.length - 1] != undefined ? matches[matches.length - 1] + word.length : 0));

        return ret;
    }
}
