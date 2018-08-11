import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
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
import { PagerService } from "../services/pager-service";
import { SearchParams } from "./search-params";
import { InfiniteScrollingService, SCROLL_POSITION, PagingHelper } from "../shared/infinite-scrolling/infinite-scrolling-module";


/**
 * Size of each data page.
 */
const PAGE_SIZE: number = 50;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {


  @ViewChild("txtSearch") txtSearch: ElementRef;

  svcInfScroll: InfiniteScrollingService<Recipe>;
  onDataFeed: EventEmitter<PagingHelper>;
  globalErrorSubscription: any;
  svcRecipe: EntityService;
  helper: Helper;
  wordAnalyzer: WordAnalyzerService;
  params: SearchParams;
  paramsTermChangedSubscription: EventEmitter<boolean>;
  asyncInProgress: boolean;

  constructor(private route: ActivatedRoute,
    private subs: SubscriptionService,
    private svcFactory: EntityServiceFactory,
    private toast: ToasterHelperService) {
  }

  ngOnInit() {
    //Initializing:
    this.params = new SearchParams();
    this.paramsTermChangedSubscription = this.params.termChanged.subscribe(value => { this.onSearchTermChangedHandler(value) });
    this.helper = new Helper();
    this.wordAnalyzer = new WordAnalyzerService();
    this.svcRecipe = this.svcFactory.getService("Recipe");
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item));
    this.resetSearch();

    if (this.route.snapshot.queryParamMap.get("term")) {
      this.params.term = this.route.snapshot.queryParamMap.get("term");
      this.search();
    }
  }

  afterViewInit() {
  }

  resetSearch() {
    this.svcInfScroll = new InfiniteScrollingService<Recipe>(PAGE_SIZE);
    this.onDataFeed = this.svcInfScroll.dataFeed.subscribe(ph => { this.onDataFeedHandler(ph) })
  }

  onSearchTermChangedHandler(value: boolean) {
    console.log("TERM    CHANGED    !!!!!")
  }

  onScrollEndHandler(e: SCROLL_POSITION) {
    console.log(`Scrolling! ${e}`);
    this.svcInfScroll.onScrollEndHandler(e);
  }

  onDataFeedHandler(ph: PagingHelper) {
    this._getPageFromAPI(ph.top, ph.skip);
  }

  search() {

    if (!this.params.termIsValid) {
      this.toast.showInformation("Para tener más éxito, te aconsejamos refinar el texto a buscar. Prueba agregando más caracteres!")
      return;
    }

    console.log("STARTING NEW SEARCH!");
    this.resetSearch();
    this._getPageFromAPI(this.svcInfScroll.pageSize, 0);
  }

  private _getPageFromAPI(top: number = 0, skip: number = 0) {

    let q: EntityServiceQueryParams = new EntityServiceQueryParams();

    q.pop = "false";
    q.filter = JSON.stringify({ $text: { $search: this.params.term } });
    q.count = "true";
    q.top = String(top);
    q.skip = String(skip);

    if (this.svcInfScroll.model) {
      this.toast.showInformation("Estamos trayendo más resultados de tu búsqueda...", "Espera!");
    }

    this.asyncInProgress = true

    //this._fakeRecipeGet(100000, 30, q)
    this.svcRecipe.get("", q)
      .subscribe(data => {
        let response: APIResponseParser = new APIResponseParser(data);
        this.svcInfScroll.feed(response.headers.XTotalCount, this.parseRecipeData(response.entities as Recipe[]))
        this.asyncInProgress = false;
      }, err => {
        this.asyncInProgress = false;
        throw err;
      });
  }

  // //Used for testing purposes only
  // private _fakeRecipeGet(totalRecipes: number, timeout: number, q: EntityServiceQueryParams) {

  //   let ret = {
  //     error: null,
  //     payload: [],
  //     headers: {
  //       XTotalCount: totalRecipes
  //     }
  //   }
  //   let top: number = Number(q.top);
  //   let skip: number = Number(q.skip);
  //   let word: string = (JSON.parse(q.filter)).$text.$search

  //   for (let i = (skip + 1); i < (skip + top + 1); i++) {
  //     let r = new Recipe()

  //     r.name = `TEST Recipe #${i} for searched word ${word.toUpperCase()}`;
  //     r.description = `This is a fake recipe created for testing purposes. Searched word is ${word}.`;
  //     r.directions.push(`Only one direction with the searched word: ${word}`);

  //     ret.payload.push(r);

  //     if (i == totalRecipes) {
  //       break;
  //     }
  //   }

  //   return {
  //     subscribe(callback, err) {
  //       setTimeout(() => {
  //         callback(ret)
  //       }, timeout);
  //     }
  //   }
  // }

  parseRecipeData(recipes: Recipe[]): Recipe[] {

    let wordsMap: Map<string, string> = new Map<string, string>();
    let wordsMapValues: string[] = [];
    let highlightOptions = { surroundingTextLong: 70, maxOcurrences: 3 }

    if (recipes && recipes.length > 0) {

      this.params.words.forEach(w => {
        wordsMap.set(w, `<mark>${w}</mark>`)
        wordsMapValues.push(`<mark>${w}</mark>`);
      })

      recipes.forEach(recipe => {

        let r: Recipe = (recipe as Recipe);

        r.name = this.wordAnalyzer.searchAndReplaceWord(r.name, wordsMap);
        r.description = this.wordAnalyzer.searchReplaceAndHighlightWord(r.description, wordsMap, highlightOptions);

        for (let i = 0; i < r.directions.length; i++) {

          let origDir: string = r.directions[i];

          r.directions[i] = this.wordAnalyzer.searchAndReplaceWord(r.directions[i], wordsMap);

          //If the search term is not in the recipe direction, we will remove it from the list.
          //There is no reason to keep the direction if the search term is not on it! :-)
          if (r.directions[i] == origDir) {
            r.directions[i] = "";
          }
          else {
            //If the search has positive results, we will show only the relevant parts:
            r.directions[i] = this.wordAnalyzer.highlightWord(r.directions[i], wordsMapValues, highlightOptions);
          }
        }
      })
    }

    return recipes;
  }

  focusSearchTextBox() {
    this.txtSearch.nativeElement.focus();
  }

  fullScrollUp() {
    this.svcInfScroll.fullScrollUp();
    this.focusSearchTextBox(); //in the case the user wants to start another search.
  }

  fullScrollDown() {
    this.svcInfScroll.fullScrollDown();
  }

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }
}
