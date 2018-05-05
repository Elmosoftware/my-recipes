import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { EntityFactory, EntityDef } from "../model/entity-factory";
import { EntityService } from "./entity-service";

@Injectable()
export class EntityServiceFactory {

  constructor(private http: HttpClient) { }

  getService(entityName: string) {
    let entityFactory = new EntityFactory();
    let entityDef = entityFactory.getEntityDef(entityName);

    return new EntityService(entityDef, this.http);
  }
}
