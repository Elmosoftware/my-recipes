import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SubscriptionService } from "../../services/subscription.service";
import { ErrorLog } from '../../model/error-log';
import { EntityServiceFactory } from "../../services/entity-service-factory";
import { EntityService } from "../../services/entity-service";

@Component({
  selector: 'app-latest-recipes',
  templateUrl: './latest-recipes.component.html',
  styleUrls: ['./latest-recipes.component.css']
})
export class LatestRecipesComponent implements OnInit {

  globalErrorSubscription: any;
  svc: EntityService;

  constructor(private subs: SubscriptionService, 
    private svcFactory: EntityServiceFactory,
    private zone: NgZone,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item))
    this.svc = this.svcFactory.getService("Recipe")
  }

  ngOnDestroy() {
    this.globalErrorSubscription.unsubscribe();
  }

  localErrorHandler(item: ErrorLog) {
    //this.showErrorToaster(item.getUserMessage());
    this.zone.run(() => {
      this.toastr.error(item.getUserMessage(), 'Ooops!, algo no anduvo bien... :-(');
    });
  }

}
