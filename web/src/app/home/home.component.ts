import { Component, OnInit } from '@angular/core';
import { SearchService, SEARCH_TYPE } from "../services/search-service";
import { Cache } from "../shared/cache/cache";
import { Helper } from "../shared/helper";
import { environment } from "../../environments/environment";
import { procastinationData } from "../static/procastinationData";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private helper: Helper;
  public procastinationRandomUrl: string;

  constructor(private cache: Cache) {
  }

  ngOnInit() {
    this.helper = new Helper();
    this.procastinationRandomUrl = procastinationData.urls[this.helper.getRandomNumberFromInterval(0, 
      procastinationData.urls.length - 1)];
  } 

  ngAfterViewInit(): void {
  }

  onSearchHandler($event: SearchService) {
    console.log(`SEARCH! type:"${$event.searchType}", term:"${$event.term}", id:"${$event.id}"`);
    $event.search();
  }

  get contactEmailLink(): string {
    return `mailto:${environment.contactEmail}`
  }
}
