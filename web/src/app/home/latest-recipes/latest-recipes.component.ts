import { Component, OnInit, Inject } from '@angular/core';
import { ToasterHelperService } from '../../services/toaster-helper-service';
//import { Observable } from 'rxjs/Rx';

import { SubscriptionService } from "../../services/subscription.service";
import { ErrorLog } from '../../model/error-log';
//import { EntityServiceFactory } from "../../services/entity-service-factory";
//import { EntityService, EntityServiceQueryParams } from "../../services/entity-service";
//import { APIResponseParser } from "../../services/api-response-parser";
import { Helper } from "../../shared/helper";
//import { Recipe } from "../../model/recipe";
//import { Entity } from '../../model/entity';
import { Cache } from "../../shared/cache/cache";

@Component({
  selector: 'app-latest-recipes',
  templateUrl: './latest-recipes.component.html',
  styleUrls: ['./latest-recipes.component.css']
})
export class LatestRecipesComponent implements OnInit {

  globalErrorSubscription: any;
  //svc: EntityService;
  //model: Entity[];
  helper: Helper;

  constructor(private subs: SubscriptionService,
    public cache: Cache,
    private toast: ToasterHelperService) {
  }
  // constructor(private subs: SubscriptionService,
  //   private svcFactory: EntityServiceFactory,
  //   private toast: ToasterHelperService) {
  // }

  ngOnInit() {
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item))
    this.helper = new Helper();
    //this.svc = this.svcFactory.getService("Recipe")
    //this.dataRefresh();
  }

  ngOnDestroy() {
    this.globalErrorSubscription.unsubscribe();
  }

  // dataRefresh() {

  //   let q = new EntityServiceQueryParams("false", "3", "", "-createdOn");

  //   this.svc.getByFilter("", q)
  //     .subscribe(
  //       data => {
  //         this.model = new APIResponseParser(data).entities;
  //       },
  //       err => {
  //         throw err
  //       });
  // }

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }
}
