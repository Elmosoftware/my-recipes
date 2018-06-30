import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { EntityFactory, EntityDef } from "../model/entity-factory";
import { EntityService } from "./entity-service";
import { Cache, CACHE_MEMBERS } from "../shared/cache/cache";

@Injectable()
export class EntityServiceFactory {

  private cache: Cache;

  constructor(private http: HttpClient) {
    console.log("EntityServiceFactory Created")
   }

  setCache(cache: Cache){
    this.cache = cache;
  }

  getService(entityName: string) {
    let entityFactory = new EntityFactory();
    let entityDef = entityFactory.getEntityDef(entityName);

    return new EntityService(entityDef, this.http, this.cache);
  }
}
