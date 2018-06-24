import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

import { EntityServiceFactory } from "../services/entity-service-factory";
import { EntityService } from "../services/entity-service";
import { APIResponseParser } from "../services/api-response-parser";
import { Entity } from "../model/entity";
import { Helper } from "../shared/helper";
import { ErrorLog } from '../model/error-log';
import { StandardDialogService, ConfirmDialogConfiguration } from "../standard-dialogs/standard-dialog.service";
import { ToasterHelperService } from '../services/toaster-helper-service';
import { SubscriptionService } from "../services/subscription.service";

@Component({
  selector: 'app-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrls: ['./recipe-view.component.css']
})
export class RecipeViewComponent implements OnInit {

  globalErrorSubscription: any;
  model: Entity;
  modelIsReady: boolean;
  svc: EntityService;
  helper: Helper;
  preparationMode: boolean;
  lastStepDone: number;
  shoppingList: string[];

  constructor(private route: ActivatedRoute,
    private subs: SubscriptionService,
    private dlgSvc: StandardDialogService,
    private svcFac: EntityServiceFactory,
    private toast: ToasterHelperService,
    private zone: NgZone) { }

  ngOnInit() {
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item));
    this.preparationMode = false;
    this.lastStepDone = 0;
    this.shoppingList = [];
    this.modelIsReady = false; //This acts like a flag to know when data retrieval process is ready or not.
    this.helper = new Helper();
    this.svc = this.svcFac.getService("Recipe");

    this.svc.getById(this.route.snapshot.paramMap.get("id"))
      .subscribe(
        data => {
          let response: APIResponseParser = new APIResponseParser(data);

          if (response.entities.length == 0) {
            this.model = null;
          }
          else {
            this.model = response.entities[0];
          }

          this.modelIsReady = true;
        },
        err => {
          throw err
        });
  }
 
  ngAfterViewInit() {
    // this.zone.runOutsideAngular(() => {
      
    //   $(document).ready(function () {
    //     console.log("running outside angular!");
        
    //     //$.fn.bootstrapTooltip = $.fn.tooltip.noConflict();
    //     // $('[data-toggle="tooltip"]').each(() =>{
    //     //   console.log("this");
    //     //   $(this).tooltip({ container: "body" })
    //     // });
        
    //     // $('#tooltip1').each(() =>{
    //     //     console.log("each");
    //     //     $(this).tooltip({ container: "body" })
    //     //   });
    //     //console.log($('#tooltip1'));

    //     //$(document.body).tooltip({ selector: "[title]" });
    //     // $(document.body).tooltip({ selector: '[data-toggle="tooltip"]' });
    //     //$('[data-toggle="tooltip"]').tooltip({container:"body"});

    //   });

    // })

  }

  enablePreparationMode(): void {

    this.dlgSvc.showConfirmDialog(new ConfirmDialogConfiguration("Modo Preparación",
      `<p>
        El modo preparación te permitirá:
      </p>
      <ul>
        <li>
          Crear una lista de compra con los ingredientes que te falten.
        </li>
        <li>
          Marcar los pasos de la preparación que hayas realizado para facilitarte el trabajo.
        </li>
      </ul>`, "Ok!, Comencemos", "Ahora no, gracias!"))
      .subscribe(result => {
        if (result == 1) {
          this.preparationMode = true;
        }
      });
  }

  stepDone(index): void {
    this.lastStepDone = index;
  }

  toggleShoppingListItem(item) {

    if (this.itemIsInShoppingList(item)) {
      this.shoppingList = this.shoppingList.filter(listItem => listItem != item)
    }
    else {
      this.shoppingList.push(item);
    }
  }

  itemIsInShoppingList(item): boolean {
    return (this.shoppingList.find(listItem => {
      return (listItem == item)
    })) ? true : false;
  }

  printShoppingList() {

    let popupWin;
    let content: string;

    content = `<p><h3>Lista de compras:</h3></p><p><ul>`;

    this.shoppingList.forEach((item) => {
      content += `<li>${item}</li>`;
    })

    content += `</ul></p>`

    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Mi lista de compras</title>
    </head>
    <body onload="window.print();window.close()">${content}</body>
    </html>
    `);
    popupWin.document.close();
  }

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }
}
