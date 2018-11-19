import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from "../../environments/environment";

import { Entity } from "../model/entity";
import { EntityDef } from "../model/entity-factory";
import { Cache, CACHE_MEMBERS } from "../shared/cache/cache";
import { AuthService } from './auth-service';

/**
 * Entities Data Service
 * @class 
 */
export class EntityService {

  constructor(private entityDef: EntityDef, 
    private http: HttpClient,
    private cache: Cache,
    private auth: AuthService) { }

  /**
   * Invalidates any cache related to this Entity. 
   */
  private invalidateCache(){
    //If the entity holds a cache key, we need to invalidate the cache so it will be refreshed next time is accessed:
    if (this.getCacheKey()) {
      this.cache.invalidateOne(this.getCacheKey() as CACHE_MEMBERS)
    }
  }

  /**
   * Returns a new and clean instance of the Entity this service is handling
   * @example
   * //If the entity is a "Recipe", calling this method is the same as execute: 
   *  new Recipe();
   * @returns An Instance of a Class that inherits from "Entity"
   */
  getNew(): Entity {
    return this.entityDef.getInstance();
  }

  /**
   * If the entity has a Cache Key, this method will return it.
   * @returns The Cache Key of this Entity or an empty string if the Entity is not in Cache.
   */
  getCacheKey(): string { 
    return this.entityDef.cacheKey;
  }

  /**
   * Fetch a document by his ID or all the ones that meet the specified criteria.
   * @param id The Object Id of the entity to retrieve. If this value is null or empty the method will return all 
   * the documents at least there is any contraint defined in the query parameters.
   * @param query Query parameters for the API like top, sort, filter and others. 
   */
  get(id: string = "", query: EntityServiceQueryParams) : Observable<Object>{
    return this.http.get(this.getUrl(id, query),  { headers: this.buildAPIHeaders() });
  }

  /**
   * Saves or Updates the provided Document.
   * @param entity Entity document to save.
   */
  save(entity): Observable<Object> {

    this.invalidateCache();
    
    //If it's an update:
    if (entity._id) {
      return this.http.put(this.getUrl(entity._id), entity, { headers: this.buildAPIHeaders() });
    }
    else { //If it's a new element:
      return this.http.post(this.getUrl(), entity, { headers: this.buildAPIHeaders() });
    }
  }

  /**
   * Deletes the provided Document by id.
   * @param id Object Id of the document to delete.
   */
  delete(id: string): Observable<Object> {

    this.invalidateCache()

    return this.http.delete(this.getUrl(id), { headers: this.buildAPIHeaders() });
  }

  /**
   * Assembles the URL to use to call the My Recipes API REST Service.
   * @param param Additional params, (like the Object Id)
   * @param query Query parameters.
   */
  private getUrl(param?: string, query?: EntityServiceQueryParams): string {

    let queryText:string = "";

    //Recall: This "param" is the ObjectId:
    if (!param) {
      param = "";
    }

    if (query) {
      queryText = query.getQueryString();
    }

    return `${environment.apiURL}${this.entityDef.apiFunction}/${param}?${queryText}`;
  }

  private buildAPIHeaders(): HttpHeaders {

    let ret: HttpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json");
      
    if (this.auth.isAuthenticated) {
      ret = ret.append("Authorization", "Bearer " + this.auth.userProfile.accessToken);
    }
    
    return ret;
  }
}

export const enum QUERY_PARAM_PUB {
  /**
   * Only include Published entities in the results.
   */
  default = "default",
  /**
   * Include both, published and not published entities in the results.
   */
  all = "all",
  /**
   *  Only include Not Published entities in the results.
   */
  notpub = "notpub"
};

export class EntityServiceQueryParams {
  
  constructor(pop: string = "", filter: string = "", top: string = "", skip: string = "", 
    sort: string = "", count: string = "", fields: string = "", pub: QUERY_PARAM_PUB = QUERY_PARAM_PUB.default) {
    this.pop = pop;
    this.top = top;
    this.skip = skip;
    this.sort = sort;
    this.filter = filter;
    this.count = count;
    this.fields = fields;
    this.pub = pub;
  }
  
  top: string;
  skip: string;
  sort: string;
  pop: string;
  filter: string;
  count: string;
  fields: string;
  pub: QUERY_PARAM_PUB

  getQueryString(): string {

    let ret = { value: "" };

    //Parsing query parameters:
    Object.getOwnPropertyNames(this).forEach((element) => {
      this.appendQueryValue(ret, element, this[element]);
    });

    return ret.value;
  }

  private appendQueryValue(query: any, paramName: string, value: string) {

    if (value) {
      query.value += `${(query.value.length > 0) ? "&" : ""}${paramName}=${value}`;
    }
  }
}
