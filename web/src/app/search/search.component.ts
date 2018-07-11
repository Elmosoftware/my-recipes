import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ToasterHelperService } from '../services/toaster-helper-service';
import { Helper } from "../shared/helper";
import { WordAnalyzerService } from "../services/word-analyzer-service";
import { SubscriptionService } from "../services/subscription.service";
import { ErrorLog } from '../model/error-log';
import { EntityServiceFactory } from "../services/entity-service-factory";
import { EntityService, EntityServiceQueryParams } from "../services/entity-service";
import { APIResponseParser } from "../services/api-response-parser";
import { Entity } from "../model/entity";
import { Recipe } from "../model/recipe";

class SearchParams {

  constructor()
  constructor(term?: string) {
    this.term = term;
  }

  term: string;

  get HTMLHighlightedTerm(): string {
    return `<mark>${this.term}</mark>`;
  }
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  modelIsReady: boolean;
  model: Recipe[];
  globalErrorSubscription: any;
  svcRecipe: EntityService;
  helper: Helper;
  wordAnalyzer: WordAnalyzerService;
  params: SearchParams;

  constructor(private route: ActivatedRoute,
    private subs: SubscriptionService,
    private svcFactory: EntityServiceFactory,
    private toast: ToasterHelperService) {
  }

  ngOnInit() {
    //Initializing:
    this.params = new SearchParams();
    this.modelIsReady = false; //This acts like a flag to know when data retrieval process is ready or not.
    this.helper = new Helper();
    this.wordAnalyzer = new WordAnalyzerService();
    this.svcRecipe = this.svcFactory.getService("Recipe");
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item));

    if (this.route.snapshot.queryParamMap.get("term")) {
      this.params.term = this.route.snapshot.queryParamMap.get("term");
      this.search();
    }
  }

  afterViewInit() {

  }

  search() {

    let q = new EntityServiceQueryParams("false");
    this.modelIsReady = false;

    //this.svcRecipe.getByFilter(`{"$text": {"$search": ${JSON.stringify(this.params.term)}}}`, q)

/*

JSON.stringify({ $text: { $search: bus}})
"{"$text":{"$search":"\"busq\""}}"

*/

    this.svcRecipe.getByFilter(JSON.stringify({ $text: { $search: this.params.term}}), q)
      .subscribe(
        data => {
          let response: APIResponseParser = new APIResponseParser(data);

          this.model = (response.entities as Recipe[]);
          this.modelIsReady = true;
          this.parseRecipeData()
        },
        err => {
          throw err
        });
  }

  parseRecipeData() {

    if (this.modelIsReady) {
      this.model.forEach(recipe => {

        let r: Recipe = (recipe as Recipe);

        r.name = this.wordAnalyzer.searchAndReplaceWord(r.name, this.params.term, this.params.HTMLHighlightedTerm);
        //r.description = this.wordAnalyzer.searchAndReplaceWord(r.description, this.params.term, this.params.HTMLHighlightedTerm);
        r.description = this.wordAnalyzer.searchReplaceAndHighlightWord(r.description, this.params.term,
          this.params.HTMLHighlightedTerm, { surroundingTextLong: 100, maxOcurrences: 3 });

        for (let i = 0; i < r.directions.length; i++) {

          let origDir: string = r.directions[i];

          r.directions[i] = this.wordAnalyzer.searchAndReplaceWord(r.directions[i], this.params.term, this.params.HTMLHighlightedTerm);

          //If the search term is not in the recipe direction, we will remove it from the list.
          //There is no reason to keep the direction if the search term is not on it! :-)
          if (r.directions[i] == origDir) {
            // r.directions.splice(i, 1);
            // i--;
            r.directions[i] = "";
          }
          else { 
            //If the search has positive results, we will show only the relevant parts:
            r.directions[i] = this.wordAnalyzer.highlightWord(r.directions[i], this.params.HTMLHighlightedTerm, 
              { surroundingTextLong: 100, maxOcurrences: 3 });              
          }
        }
      })
    }
  }

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }
}
