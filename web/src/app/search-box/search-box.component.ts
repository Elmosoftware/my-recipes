import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from "@angular/forms";
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { EntityServiceFactory } from "../services/entity-service-factory";
import { EntityService, EntityServiceQueryParams } from '../services/entity-service';
import { ToasterHelperService } from "../services/toaster-helper-service";
import { APIResponseParser } from "../services/api-response-parser";
import { Ingredient } from '../model/ingredient';
import { SearchService, SEARCH_TYPE } from "../services/search-service";

@Component({
  selector: 'search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit {

  @Input() searchType: SEARCH_TYPE = SEARCH_TYPE.Text;

  @Input() initialTerm: string;

  @Input() initialId: string;
  
  @Input() placeHolder: string = "Busca recetas con ...";

  @Output() search = new EventEmitter<SearchService>(); 

  selectedValue: SearchService;
  suggestions: SuggestedItem[];
  optionSelectedFlag: boolean;
  searchTextBox: FormControl;
  svcIngredients: EntityService;

  constructor(private router: Router, private svcFactory: EntityServiceFactory, private toast: ToasterHelperService) {
  }

  ngOnInit() {
    this.selectedValue = null;
    this.suggestions = [];
    this.optionSelectedFlag = false;
    this.searchTextBox = new FormControl();
    this.svcIngredients = this.svcFactory.getService("Ingredient");
    this.parseInput();

    //We set the initial values if any:
    if (this.initialTerm || this.initialId) {
      this.selectedValue = new SearchService(this.router, this.searchType, this.initialTerm, this.initialId);
      this.searchTextBox.setValue(this.selectedValue.term, { emitEvent: false });
    }

    this.searchTextBox.valueChanges
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(value => { this.valueChangeHandle(value) });
  }

  afterViewInit() {
  }

  parseInput() {
    this.searchType = SearchService.parseSearchType(this.searchType);
  }

  valueChangeHandle(text: string) {

    //If there is no search text, we reset the values:
    if (!text) {
      this.suggestions = [];
      this.selectedValue = null;
      return;
    }

    if (this.searchType != SEARCH_TYPE.Text) {
      //If the text changes and we have at least one suggestion but no selected value yet. We need to check if the 
      //current text matches any of the current suggestions, if that's the case, we have a selected value!
      this.selectedValue = null;
      if (this.suggestions.length > 0) {
        this.suggestions.forEach((s: SuggestedItem) => {
          if (text.toLowerCase() == s.text.toLowerCase()) {
            this.selectedValue = new SearchService(this.router, this.searchType, s.text, s.id);
            return;
          }
        });
      }

      //If there is a selected value, we set the text in the search text box, if not, we look again for suggestions:
      if (this.selectedValue) {
        this.searchTextBox.setValue(this.selectedValue.term, { emitEvent: false });

        //If the selected value was chosen directly from the suggestions panel, then we can proceed to do the search directly!:
        if (this.optionSelectedFlag) {
          this.optionSelectedFlag = false;
          this.startSearching();  
        }        
      }
      else {
        this.findSuggestions(text);
      }
    }
    else{ //If it's a text search:
      if (this.selectedValue) {
        this.selectedValue.term = text;
      }
      else{
        this.selectedValue = new SearchService(this.router, this.searchType, text);
      }
    }
  }

  findSuggestions(text: string) {

    let q = new EntityServiceQueryParams();
    q.pop = "true";
    q.filter = JSON.stringify({ name: { $regex: text, $options: "i" } });
    q.top = "5"

    console.log(`Value:${text}, Search type:${this.searchType}, Type: ${typeof this.searchType}`);

    this.svcIngredients.get("", q)
      .subscribe(data => {
        let response: APIResponseParser = new APIResponseParser(data);
        this.suggestions = this.ingredientsToList(response.entities as Ingredient[]);
      });

  }

  ingredientsToList(ingredients: Ingredient[]): SuggestedItem[] {
    let ret: SuggestedItem[] = [];

    if (ingredients && Array.isArray(ingredients)) {
      ingredients.forEach((ing: Ingredient) => {
        ret.push(new SuggestedItem(ing._id, ing.name));
      })
    }

    return ret;
  }

  optionSelected($event) {
    console.log(`option.viewValue: ${$event.option.viewValue}, option.value: ${$event.option.value}`)
    this.optionSelectedFlag = true;
    this.searchTextBox.setValue($event.option.viewValue);
  }

  startSearching() {

    if (!this.selectedValue) {
      return;
    }

    if (!this.selectedValue.termIsValid) {
      this.toast.showInformation("Para tener más éxito, te aconsejamos refinar el texto a buscar. Prueba agregando más caracteres!")
      return;
    }

    //console.log("SEARCH!");
    this.search.emit(this.selectedValue);
  }
}

class SuggestedItem {
  constructor(id: string, text: string) {
    this.id = id;
    this.text = text;
  }

  public readonly id: string;
  public readonly text: string;
}
