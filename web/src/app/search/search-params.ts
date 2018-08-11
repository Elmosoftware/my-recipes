import { EventEmitter } from "@angular/core";

export class SearchParams {

    constructor()
    constructor(term?: string) {
      this.words = [];
      this.term = (!term) ? "" : term ;
      this.minTermLength = 3;
    }
  
    public termChanged: EventEmitter<boolean> = new EventEmitter();

    private _term: string;
  
    public words: string[];
  
    public minTermLength: number;
  
    get termIsValid(): boolean{
      if (this.term && this.term.length >= this.minTermLength) {
        return true;
      }
      else{
        return false;
      }
    }
    
    get term(): string {
      return this._term;
    }
    set term(value: string) {
  
      let sep: string;
  
      this._term = value;
      value = value.replace(/'/g, `"`); //If the value has single quotes, we replace them with double quotes.
      sep = (value.indexOf(`"`) != -1) ? `"` : ` `; //If there is a quoted string, we will separate by quotes, if not by spaces.
      this.words = value.split(sep)
        .filter( v => { return v != "" }); //We creates the word dictionary.
      this.termChanged.emit(true);
    }
  }
  