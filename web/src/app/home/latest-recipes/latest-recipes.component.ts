import { Component, OnInit, Inject } from '@angular/core';
import { ToasterHelperService } from '../../services/toaster-helper-service';
import { Observable } from 'rxjs/Rx';

import { SubscriptionService } from "../../services/subscription.service";
import { ErrorLog } from '../../model/error-log';
import { EntityServiceFactory } from "../../services/entity-service-factory";
import { EntityService, EntityServiceQueryParams } from "../../services/entity-service";
import { APIResponse } from "../../model/api-response";
import { Recipe } from "../../model/recipe";
import { Entity } from '../../model/entity';

@Component({
  selector: 'app-latest-recipes',
  templateUrl: './latest-recipes.component.html',
  styleUrls: ['./latest-recipes.component.css']
})
export class LatestRecipesComponent implements OnInit {

  globalErrorSubscription: any;
  svc: EntityService;
  model: Entity[];

  constructor(private subs: SubscriptionService,
    private svcFactory: EntityServiceFactory,
    private toast: ToasterHelperService) {
  }

  ngOnInit() {
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item))
    this.svc = this.svcFactory.getService("Recipe")
    this.dataRefresh();
  }

  ngOnDestroy() {
    this.globalErrorSubscription.unsubscribe();
  }

  dataRefresh() {

    let q = new EntityServiceQueryParams("false", "3", "", "-createdOn");

    this.svc.getByFilter("", q)
      .subscribe(
        data => {
          let response = new APIResponse(data);
          this.model = response.entities;
          if (response.error) {
            throw response.error;
          }
        },
        err => {
          throw err
        });
  }

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }

}
