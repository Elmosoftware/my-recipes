import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
import { SearchService, SEARCH_TYPE } from "../services/search-service";
import { InfiniteScrollingService, SCROLL_POSITION, PagingHelper } from "../shared/infinite-scrolling/infinite-scrolling-module";
import { RecipeIngredient } from '../model/recipe-ingredient';


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

  svcInfScroll: InfiniteScrollingService<Recipe>;
  onDataFeed: EventEmitter<PagingHelper>;
  globalErrorSubscription: any;
  svcRecipe: EntityService;
  svcRecipeIngredients: EntityService;
  helper: Helper;
  wordAnalyzer: WordAnalyzerService;
  svcSearch: SearchService;
  initialValues = { term: "", id: "" };
  paramsTermChangedSubscription: EventEmitter<boolean>;
  asyncInProgress: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private subs: SubscriptionService,
    private svcFactory: EntityServiceFactory,
    private toast: ToasterHelperService) {
  }

  ngOnInit() {
    //Initializing:
    this.svcSearch = new SearchService(this.router);
    this.helper = new Helper();
    this.wordAnalyzer = new WordAnalyzerService();
    this.svcRecipe = this.svcFactory.getService("Recipe");
    this.svcRecipeIngredients = this.svcFactory.getService("RecipeIngredient");
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item));
    this.resetSearch();
    this.parseQueryparams();
  }

  afterViewInit() {
  }

  resetSearch() {
    this.svcInfScroll = new InfiniteScrollingService<Recipe>(PAGE_SIZE);
    this.onDataFeed = this.svcInfScroll.dataFeed.subscribe(ph => { this.onDataFeedHandler(ph) })
  }

  parseQueryparams() {
    if (this.route.snapshot.queryParamMap.get("term")) {

      this.svcSearch.term = this.route.snapshot.queryParamMap.get("term");
      this.initialValues.term = this.svcSearch.term;

      if (this.route.snapshot.queryParamMap.get("type")) {
        this.svcSearch.searchType = SearchService.parseSearchType(this.route.snapshot.queryParamMap.get("type"));
      }
      else {
        this.svcSearch.searchType = SEARCH_TYPE.Text
      }

      if (this.route.snapshot.queryParamMap.get("id")) {
        this.svcSearch.id = this.route.snapshot.queryParamMap.get("id");
        this.initialValues.id = this.svcSearch.id;
      }

      this.search();
    }
  }

  onScrollEndHandler(e: SCROLL_POSITION) {
    console.log(`Scrolling! ${e}`);
    this.svcInfScroll.onScrollEndHandler(e);
  }

  onDataFeedHandler(ph: PagingHelper) {
    this._getRecipes(ph.top, ph.skip);
  }

  onSearchHandler($event: SearchService) {
    console.log(`SEARCH! type:"${$event.searchType}", term:"${$event.term}", id:"${$event.id}"`);
    this.svcSearch.term = $event.term;
    this.svcSearch.id = $event.id;
    this.search();
  }

  search() {

    if (!this.svcSearch.termIsValid) {
      this.toast.showInformation("Para tener más éxito, te aconsejamos refinar el texto a buscar. Prueba agregando más caracteres!")
      return;
    }

    console.log("STARTING NEW SEARCH!");
    this.resetSearch();
    this._getRecipes(this.svcInfScroll.pageSize, 0);
  }

  private _getRecipes(top: number = 0, skip: number = 0) {

    if (this.svcInfScroll.model) {
      this.toast.showInformation("Estamos trayendo más resultados de tu búsqueda...", "Espera!");
    }

    switch (this.svcSearch.searchType) {
      case SEARCH_TYPE.Text:
        this._getRecipesByText(top, skip, this.svcSearch.term);
        break;
      case SEARCH_TYPE.Ingredient:
        this._getRecipesByIngredient(top, skip, this.svcSearch.id);
        break;
      default:
        //If the search type is not defined here, do nothing!.
        return;
    }
  }

  private _getRecipesByText(top: number = 0, skip: number = 0, term: string) {

    let q: EntityServiceQueryParams = new EntityServiceQueryParams();

    q.pop = "false";
    q.count = "true";
    q.top = String(top);
    q.skip = String(skip);
    q.fields = "name description directions";
    q.filter = JSON.stringify({ $text: { $search: term } });

    this.asyncInProgress = true;

    //this._fakeRecipeGet(100000, 30, q)
    this.svcRecipe.get("", q)
      .subscribe(data => {
        let response: APIResponseParser = new APIResponseParser(data);
        this.svcInfScroll.feed(response.headers.XTotalCount, this.parseRecipes(response.entities as Recipe[]))
        this.asyncInProgress = false;
      }, err => {
        this.asyncInProgress = false;
        throw err;
      });
  }

  private _getRecipesByIngredient(top: number = 0, skip: number = 0, ingredientId: string) {
    let q: EntityServiceQueryParams = new EntityServiceQueryParams();

    q.pop = "true";
    q.count = "true";
    q.top = String(top);
    q.skip = String(skip);
    q.filter = JSON.stringify({ ingredient: { $eq: ingredientId } });

    this.asyncInProgress = true;

    //We search for all the "RecipeIngredients" that have the searched ingredient:
    this.svcRecipeIngredients.get("", q)
      .subscribe(data => {
        let response: APIResponseParser = new APIResponseParser(data);
        let recipes: Recipe[] = [];

        response.entities.forEach((item: RecipeIngredient) => {
          //Because we are searching "RecipeIngredients", even when we populate the results, the ingredient data 
          //is below 2nd level subdocument so didn´t get populated. 
          //Then we need to copy this data from the RecipeIngredient to the Recipe:
          item.recipe.ingredients = [];
          item.recipe.ingredients.push(new RecipeIngredient());
          item.recipe.ingredients[0].ingredient = item.ingredient;
          item.recipe.ingredients[0].amount = item.amount;
          item.recipe.ingredients[0].unit = item.unit;

          recipes.push(item.recipe);
        })

        this.svcInfScroll.feed(response.headers.XTotalCount, this.parseRecipes(recipes))
        this.asyncInProgress = false;
      }, err => {
        this.asyncInProgress = false;
        throw err;
      });
  }

  /* //Used for testing purposes only
  private _fakeRecipeGet(totalRecipes: number, timeout: number, q: EntityServiceQueryParams) {

    let ret = {
      error: null,
      payload: [],
      headers: {
        XTotalCount: totalRecipes
      }
    }
    let top: number = Number(q.top);
    let skip: number = Number(q.skip);
    let word: string = (JSON.parse(q.filter)).$text.$search

    for (let i = (skip + 1); i < (skip + top + 1); i++) {
      let r = new Recipe()

      r.name = `TEST Recipe #${i} for searched word ${word.toUpperCase()}`;
      r.description = `This is a fake recipe created for testing purposes. Searched word is ${word}.`;
      r.directions.push(`Only one direction with the searched word: ${word}`);

      ret.payload.push(r);

      if (i == totalRecipes) {
        break;
      }
    }

    return {
      subscribe(callback, err) {
        setTimeout(() => {
          callback(ret)
        }, timeout);
      }
    }
  }
*/

  parseRecipes(recipes: Recipe[]): Recipe[] {

    switch (this.svcSearch.searchType) {
      case SEARCH_TYPE.Text:
        return this.parseRecipesFromTextSearch(recipes);
      case SEARCH_TYPE.Ingredient:
      this.parseRecipesFromIngredientsSearch(recipes);
      default:
        //If the search type is not defined here, do nothing!.
        return recipes;
    }
  }

  parseRecipesFromTextSearch(recipes: Recipe[]): Recipe[] {

    let wordsMap: Map<string, string> = new Map<string, string>();
    let wordsMapValues: string[] = [];
    let highlightOptions = { surroundingTextLong: 70, maxOcurrences: 3 }

    if (recipes && recipes.length > 0) {

      this.svcSearch.words.forEach(w => {
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
      });
    }

    return recipes;
  }

  parseRecipesFromIngredientsSearch(recipes: Recipe[]): Recipe[] {

    if (recipes && recipes.length > 0) {
      recipes.forEach(recipe => {

        let r: Recipe = (recipe as Recipe);

        r.description = this.helper.getShortText(r.description); //Showing a shorter description.
        r.directions = []; //Removing all directions. Are not relevant for Ingredients search.

        for (let i = 0; i < r.ingredients.length; i++) {

          //We will remove all the ingredients that are not the ones we search for:
          if (String(r.ingredients[i].ingredient._id) != this.svcSearch.id) {
            r.ingredients.splice(i, 1);
            i--;
          }
        }
      })
    }

    return recipes;
  }

  fullScrollUp() {
    this.svcInfScroll.fullScrollUp();
  }

  fullScrollDown() {
    this.svcInfScroll.fullScrollDown();
  }

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }
}
