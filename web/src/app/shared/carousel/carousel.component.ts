import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {

  /**
   * List of "CarouselItems" to be displayed.
   */
  @Input() items: CarouselItem[];

  constructor() { }

  ngOnInit() {
  }
}

export class CarouselItem {

  constructor() {
  }

  imageSrc: string;
  authorName: string;
  authorURL: string;
  captionImageSrc: string;
  captionText: string;
}

