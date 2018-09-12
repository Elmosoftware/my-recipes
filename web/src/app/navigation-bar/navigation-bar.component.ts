import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService, SEARCH_TYPE } from "../services/search-service";

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  onSearchHandler($event: SearchService){
    console.log(`SEARCH! type:"${$event.searchType}", term:"${$event.term}", id:"${$event.id}"`);
    $event.search();
  }
}
