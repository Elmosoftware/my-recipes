import { Component, OnInit, EventEmitter, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterHelperService } from '../services/toaster-helper-service';
import { Helper } from "../shared/helper";
import { SubscriptionService } from "../services/subscription.service";
import { ErrorLog } from '../model/error-log';
import { EntityServiceFactory } from "../services/entity-service-factory";
import { EntityService, EntityServiceQueryParams, QUERY_PARAM_PUB } from "../services/entity-service";
import { APIResponseParser } from "../services/api-response-parser";
import { Recipe } from "../model/recipe";
import { InfiniteScrollingService, SCROLL_POSITION, PagingHelper } from "../shared/infinite-scrolling/infinite-scrolling-module";
import { Cache } from '../shared/cache/cache';
import { AuthService } from '../services/auth-service';


/**
 * Size of each data page.
 */
const PAGE_SIZE: number = 50;

@Component({
  selector: 'app-my-recipes',
  templateUrl: './my-recipes.component.html',
  styleUrls: ['./my-recipes.component.css']
})
export class MyRecipesComponent implements OnInit {

  globalErrorSubscription: any;
  helper: Helper;
  asyncInProgress: boolean;
  svcRecipe: EntityService;
  svcInfScroll: InfiniteScrollingService<Recipe>;
  onDataFeed: EventEmitter<PagingHelper>;
  mealTypesFilter: number[];
  notPublishedOnlyFilter: boolean;

  constructor(private zone: NgZone,
    private router: Router,
    private cache: Cache,
    private subs: SubscriptionService,
    private svcFactory: EntityServiceFactory,
    private authSvc: AuthService,
    private toast: ToasterHelperService) {
  }

  ngOnInit() {
    //Initializing:
    this.mealTypesFilter = [];
    this.helper = new Helper();
    this.svcRecipe = this.svcFactory.getService("Recipe");
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item));
    this.reset();
  }

  reset() {
    this.svcInfScroll = new InfiniteScrollingService<Recipe>(PAGE_SIZE);
    this.resetMealTypesFilterCounters();
    this.onDataFeed = this.svcInfScroll.dataFeed.subscribe(ph => { this.onDataFeedHandler(ph) })

    if(this.isAnyFilterSet){
      this.getRecipes(this.svcInfScroll.pageSize, 0);
    }
  }

  onScrollEndHandler(e: SCROLL_POSITION) {
    console.log(`Scrolling! ${e}`);
    this.svcInfScroll.onScrollEndHandler(e);
  }

  onDataFeedHandler(ph: PagingHelper) {
    this.getRecipes(ph.top, ph.skip);
  }

  fullScrollUp() {
    this.svcInfScroll.fullScrollUp();
  }

  fullScrollDown() {
    this.svcInfScroll.fullScrollDown();
  }

  //This method gets called every time the list of filter options changes
  toggleMealType(id) {

    if(Object.keys(this.mealTypesFilter).indexOf(id) == -1){
      this.mealTypesFilter[id] = 0; //The number is the count.
    }
    else {
      delete this.mealTypesFilter[id];
    }

    console.log("STARTING NEW SEARCH!");
    this.reset();
  }

  toggleNotPublishedOnly() {
    this.notPublishedOnlyFilter = !this.notPublishedOnlyFilter;
    console.log("STARTING NEW SEARCH!");
    this.reset();
  }

  get isAnyFilterSet() : boolean {
    return Object.keys(this.mealTypesFilter).length > 0;
  }

  getMealTypesFilter(): string[] {
    return Object.keys(this.mealTypesFilter);
  }

  resetMealTypesFilterCounters() :void{
    Object.keys(this.mealTypesFilter).forEach(id =>{
      this.mealTypesFilter[id] = 0;
    })
  }

  setMealTypeFilterCounters(recipes: Recipe[]): void{
    recipes.forEach( r => {
      this.mealTypesFilter[r.mealType._id]++;
    });
  }

  getMealTypeFilterCountById(id: string): string{
    let ret: string = "";

    if(this.mealTypesFilter[id]){
      ret = String(this.mealTypesFilter[id]);

      //If not all the results has been retrieved yet:
      if(this.svcInfScroll.count != this.svcInfScroll.totalCount){
        ret += "...";
      }
      ret = `(${ret})`;
    }

    return ret;
  }

  getFooter(r: Recipe): string{
    let ret: string;

    if(r.lastUpdateOn){
      ret = "Última actualización: " + this.helper.friendlyTimeFromNow(r.lastUpdateOn);
    }
    else{
      ret = "Creada: " + this.helper.friendlyCalendarTime(r.createdOn);
    }

    return ret;
  }

  getFooterPublishingData(r: Recipe): string{
    let ret: string = "Aún no publicada";

    if(r.publishedOn){
      ret = this.helper.friendlyTimeFromNow(r.publishedOn);
    }

    return ret;
  }
  
  private getRecipes(top: number = 0, skip: number = 0) {

    let q: EntityServiceQueryParams = new EntityServiceQueryParams();

    if (this.svcInfScroll.model) {
      this.toast.showInformation("Estamos trayendo más resultados de tu búsqueda...", "Espera!");
    }

    q.pop = "true";
    q.count = "true";
    q.top = String(top);
    q.skip = String(skip);
    q.fields = "-ingredients -directions";
    q.filter = JSON.stringify({
      $and: [ 
        { mealType: { $in: this.getMealTypesFilter() },
        $or: [ { "lastUpdateBy": this.authSvc.userProfile.userId}, {"createdBy": this.authSvc.userProfile.userId}] 
      }]
    });
    q.pub = (this.notPublishedOnlyFilter) ? QUERY_PARAM_PUB.notpub : QUERY_PARAM_PUB.all;

    this.asyncInProgress = true;

    // this._fakeRecipeGet(300, 1000, q)
    this.svcRecipe.get("", q)
      .subscribe(data => {
        let response: APIResponseParser = new APIResponseParser(data);
        this.svcInfScroll.feed(response.headers.XTotalCount, (response.entities as Recipe[]));
        this.asyncInProgress = false;
        this.setMealTypeFilterCounters((response.entities as Recipe[]));
      }, err => {
        this.asyncInProgress = false;
        throw err;
      });
  }

  viewRecipe(id:string){
    this.helper.removeTooltips(this.zone);
    this.router.navigate([`/recipe-view/${id}`],)
  }

  editRecipe(id: string){
    this.helper.removeTooltips(this.zone);
    this.router.navigate([`/recipe/${id}`]);
  }
  
  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }

  /*
  //Used for testing purposes only
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
    
    for (let i = (skip + 1); i < (skip + top + 1); i++) {
      let r: any = new Object()

      r.name = `TEST Recipe #${i}`;
      r.description = `This is a fake recipe created for testing purposes.`;
      r.createdOn = this.helper.addDays(new Date(), -i) //new Date((new Date()).getDate() - i)

      if (i==2) {
        r.lastUpdateOn = this.helper.addDays(r.createdOn, -1);
        r.name += "This one with even longest recipe name."
        r.description += "Plus more description here to test long description text handling."
      }

      r.estimatedTime = 30;
      r.level = { name: "Experto" }; // as Level);
      r.mealType = { _id: "5af1f8fc52bf1d8be0edd3fb", name: "Aperitivo" };
      
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
}
