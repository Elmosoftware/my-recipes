import { Component, OnChanges, OnInit, AfterViewInit, Input } from '@angular/core';
import { trigger, state, animate, transition, style } from '@angular/animations';

import { Router } from '@angular/router';
import { SearchService, SEARCH_TYPE } from "../services/search-service";

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css'],
  animations: [
    trigger('isVisibleChanged', [
      state('true', style({ opacity: 1 })),
      state('false', style({ opacity: 0 })),
      transition('* => *', animate('.5s'))])
  ]
})
export class NavigationBarComponent implements OnInit {

  @Input() homePageFeaturesEnabled: boolean;
  @Input() adminMenuEnabled: boolean;
  @Input() searchBoxEnabled: boolean;

  isVisible: boolean;

  constructor(private router: Router) {
  }

  ngOnInit() {
    
  }

  afterViewInit() {
    this.isVisible = true;
  }

  onScrollHandler($event: number) {
    // console.log(`onScroll: ${$event} isVisible:${this.isVisible}`);
    this.isVisible = (isNaN($event) || $event < 5);
  }

  onSearchHandler($event: SearchService) {
    // console.log(`SEARCH! type:"${$event.searchType}", term:"${$event.term}", id:"${$event.id}"`);
    $event.search();
  }
}
