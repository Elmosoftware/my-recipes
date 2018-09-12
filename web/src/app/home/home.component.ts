import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import { SearchService, SEARCH_TYPE } from "../services/search-service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private fragment: string;
  
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
  }

  ngAfterViewInit(): void {
    try {
      document.querySelector('#' + this.fragment).scrollIntoView();
    } catch (e) { }
  }

  onSearchHandler($event: SearchService){
    console.log(`SEARCH! type:"${$event.searchType}", term:"${$event.term}", id:"${$event.id}"`);
    $event.search();
  }

}
