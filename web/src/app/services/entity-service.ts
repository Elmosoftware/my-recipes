import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from "../../environments/environment";

import { Entity } from "../model/entity";
import { EntityFactory, EntityDef } from "../model/entity-factory";

export class EntityService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private entityDef: EntityDef, private http: HttpClient) { }

  getNew(): Entity {
    return this.entityDef.getInstance();
  }

  getCacheKey(): string {
    return this.entityDef.cacheKey;
  }

  getAll(): Observable<Object> {
    return this.http.get(this.getUrl(), this.httpOptions);
  }

  getById(id: string, query?: EntityServiceQueryParams): Observable<Object> {
    return this.http.get(this.getUrl(id, query), this.httpOptions);
  }

  getByFilter(condition: string, query?: EntityServiceQueryParams): Observable<Object> {
    return this.http.get(this.getUrl(condition, query), this.httpOptions);
  }

  save(entity): Observable<Object> {

    //If it's an update:
    if (entity._id) {
      return this.http.put(this.getUrl(entity._id), entity, this.httpOptions);
    }
    else { //If it's a new element:
      return this.http.post(this.getUrl(), entity, this.httpOptions);
    }
  }

  delete(id: string): Observable<Object> {
    return this.http.delete(this.getUrl(id), this.httpOptions);
  }

  private getUrl(param?: string, query?: EntityServiceQueryParams): string {

    let queryText:string = "";

    //Recall: This "param" could be both, an ObjectId or a JSON filter condition.
    if (!param) {
      param = "";
    }

    if (query) {
      queryText = query.getQueryString();
    }

    return `${environment.apiURL}${this.entityDef.apiFunction}/${param}?${queryText}`;
  }
}

export class EntityServiceQueryParams {

  constructor(pop: string);
  constructor(top: string, skip?: string);
  constructor(top: string, skip?: string, sort?: string);
  constructor(pop: string, top: string, skip?: string, sort?: string, );
  constructor(pop?: string, top?: string, skip?: string, sort?: string, ) {
    this.pop = pop;
    this.top = top;
    this.skip = skip;
    this.sort = sort;
  }

  top: string;
  skip: string;
  sort: string;
  pop: string;

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
