import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Rx';
import { ToasterHelperService } from "../services/toaster-helper-service";
import { Router, ActivatedRoute, Params, Data } from "@angular/router";
import { CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

import { EntityServiceFactory } from "../services/entity-service-factory";
import { EntityService, EntityServiceQueryParams, QUERY_PARAM_PUB } from "../services/entity-service";
import { Entity } from "../model/entity";
import { ErrorLog } from '../model/error-log';
import { APIResponseParser } from "../services/api-response-parser";
import { SubscriptionService } from "../services/subscription.service";
import { StandardDialogService, ConfirmDialogConfiguration } from "../standard-dialogs/standard-dialog.service";
import { Cache, CACHE_MEMBERS } from "../shared/cache/cache";
import { Helper } from '../shared/helper';

@Component({
  selector: 'app-backend-entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.css']
})
export class EntitiesComponent implements OnInit {

  helper: Helper
  model: Entity[];
  globalErrorSubscription: any;
  type: string;
  title: string;
  defaultSort: string;
  svc: EntityService;

  constructor(
    private zone: NgZone,
    private svcFactory: EntityServiceFactory,
    public dialog: MatDialog,
    private subs: SubscriptionService,
    private toast: ToasterHelperService,
    private dlgSvc: StandardDialogService,
    private route: ActivatedRoute,
    private cache: Cache) {
  }

  ngOnInit() {
    this.helper = new Helper();
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item))

    this.type = this.route.snapshot.data['type'];
    this.title = this.route.snapshot.data['title'];
    this.defaultSort = this.route.snapshot.data['defaultSort'];
    this.svc = this.svcFactory.getService(this.type);

    this.dataRefresh();
  }

  ngOnDestroy() {
    this.globalErrorSubscription.unsubscribe();
  }

  dataRefresh() {

    let q = new EntityServiceQueryParams();
    q.pub = QUERY_PARAM_PUB.all; //We would like to see all the entities, regardless if they are published or not.

    if (this.defaultSort) {
      q.sort = this.defaultSort;
    }

    this.svc.get("", q)
      .subscribe(
        data => {
          this.model = new APIResponseParser(data).entities;

          if (this.model.length == 0) {
            this.toast.showInformation(`La búsqueda no devolvió resultados. Agregue un elemento haciendo click en el botón "+".`);
          }
        },
        err => {
          throw err
        });
  }

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }

  openDialog(entityId: string): void {

    this.helper.removeTooltips(this.zone);
    console.log(`Received Entity ID: "${entityId}"`);

    if (entityId) {

      let query = new EntityServiceQueryParams("false")

      this.svc.get(entityId, query)
        .subscribe(data => {
          let ent = new APIResponseParser(data).entities[0];
          this.editAndSave(ent);
        },
          err => {
            throw err
          });
    }
    else {
      this.editAndSave(this.svc.getNew());
    }
  }

  editAndSave(entity: Entity): void {

    this.dlgSvc.showEditEntityDialog(this.type, entity).subscribe(result => {

      console.log(`Dialog closed. Result: "${result}" `);

      //If the user does not cancelled the dialog:
      if (typeof result === "object") {
        console.log(`DATA: Name= "${result.name}"`);
        this.svc.save(result)
          .subscribe(data => {

            let respData = new APIResponseParser(data);
            console.log(`After Save`);
            console.log(`Error:"${respData.error}", Payload:"${respData.entities}"`);

            if (!respData.error) {
              this.toast.showSuccess("Los cambios se guardaron con éxito!");
              this.dataRefresh();
              // //If the entity holds a cache key, we need to invalidate the cache so it will be refreshed next time is accessed:
              // if (this.svc.getCacheKey()) {
              //   this.cache.invalidateOne(this.svc.getCacheKey() as CACHE_MEMBERS)
              // }
            }
          }, err => {
            throw err
          });
      }
    });
  }

  delete(entityId: string): void {

    this.helper.removeTooltips(this.zone);
    this.dlgSvc.showConfirmDialog(new ConfirmDialogConfiguration("Confirmación de borrado",
      "¿Confirma la eliminación del item seleccionado?")).subscribe(result => {

        console.log(`Dialog closed. Result: "${result}" `);

        if (result == 1) {
          this.svc.delete(entityId)
            .subscribe(data => {

              let respData = new APIResponseParser(data);

              console.log(`After Delete`);
              console.log(`Error:"${respData.error}", Payload:"${respData.entities}"`);

              if (!respData.error) {
                this.toast.showSuccess("El elemento ha sido eliminado.");
                this.dataRefresh();
                // //If the entity holds a cache key, we need to invalidate the cache so it will be refreshed next time is accessed:
                // if (this.svc.getCacheKey()) {
                //   this.cache.invalidateOne(this.svc.getCacheKey() as CACHE_MEMBERS)
                // }
              }
            }, err => {
              throw err
            });
        }
      });
  }
}
