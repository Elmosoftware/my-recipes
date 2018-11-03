import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { EntityFactory, EntityDef } from "../model/entity-factory";
import { EntityService } from "./entity-service";
import { Cache } from "../shared/cache/cache";
import { AuthService } from "../services/auth-service";

@Injectable()
export class EntityServiceFactory {

  private cache: Cache;

  constructor(private http: HttpClient, private auth: AuthService) {
    console.log("EntityServiceFactory Created")
   }

  setCache(cache: Cache){
    this.cache = cache;
  }

  getService(entityName: string) {
    let entityFactory = new EntityFactory();
    let entityDef = entityFactory.getEntityDef(entityName);

    return new EntityService(entityDef, this.http, this.cache, this.auth);
  }
}
