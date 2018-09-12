import { Router } from '@angular/router';

export enum SEARCH_TYPE {
  Text = "text",
  Ingredient = "ingredient"
}

export class SearchService {

    constructor(router: Router, type: SEARCH_TYPE = SEARCH_TYPE.Text, term: string = "", id: string = "") {
      this.words = [];
      this.term = (!term) ? "" : term ;
      this.id = (!id) ? "" : id ;
      this.minTermLength = 3;
      this.searchType = type;
      this._router = router;
    }
  
    private _router: Router;

    private _term: string;
  
    public searchType: SEARCH_TYPE;

    public id: string;

    public words: string[];
  
    public minTermLength: number;
  
    get termIsValid(): boolean{

      let ret: boolean = (this.term) ? true : false; 

      if (ret && this.searchType == SEARCH_TYPE.Text) {
        ret = this.term.length >= this.minTermLength; //We check the term is at least longer as the minimum defined length.
      }

      if (ret && this.searchType == SEARCH_TYPE.Ingredient) {
        ret = (this.id && this.id.length > 0) //We need to specify an ingredient ID in the case of a search by ingredient.
      }

      return ret;
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
    }

    search(){

      if (!this.termIsValid) {
        throw new Error(`The search term is not valid. The search operation will be aborted.`);
      }

      this._router.navigate(["/search"], { queryParams: { type: this.searchType, term: this.term, id: this.id } } )
    }

    static parseSearchType(type: string): SEARCH_TYPE{
      switch (String(type).toLowerCase()) {
        case SEARCH_TYPE.Text:
          return SEARCH_TYPE.Text;
        case SEARCH_TYPE.Ingredient:
          return SEARCH_TYPE.Ingredient;
        default:
          return SEARCH_TYPE.Text
      }
    }
}
