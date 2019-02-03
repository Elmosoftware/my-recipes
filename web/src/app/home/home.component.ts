import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';

// import { MediaService } from "../services/media-service";
//import { APIResponseParser } from "../services/api-response-parser";
import { SearchService, SEARCH_TYPE } from "../services/search-service";
// import { CarouselItem } from '../shared/carousel/carousel.component';
import { Cache } from "../shared/cache/cache";
//import { Helper } from "../shared/helper";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // private fragment: string;
  // private helper: Helper;
  // public carouselItems: CarouselItem[];

  //constructor(private route: ActivatedRoute, private cache: Cache, private svcMedia: MediaService) {
  constructor(private cache: Cache) {
  }

  ngOnInit() {
    //this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
    //this.helper = new Helper();

    // this.svcMedia.getDynamicHomePagePictures()
    //   .subscribe(data => {
    //     this.carouselItems = (data as CarouselItem[]);
    //   }); 
  } 

  ngAfterViewInit(): void {
    // try {
    //   document.querySelector('#' + this.fragment).scrollIntoView();
    // } catch (e) { }
  }

  onSearchHandler($event: SearchService) {
    console.log(`SEARCH! type:"${$event.searchType}", term:"${$event.term}", id:"${$event.id}"`);
    $event.search();
  }
}
