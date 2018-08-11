import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollingDirective, SCROLL_POSITION } from "./infinite-scrolling-directive";
import { InfiniteScrollingService } from "./infinite-scrolling-service";
import { PagingHelper } from "../../services/pager-service";

export { InfiniteScrollingService } from "./infinite-scrolling-service";
export { PagingHelper } from "../../services/pager-service"
export { SCROLL_POSITION } from "./infinite-scrolling-directive"

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    InfiniteScrollingDirective
  ],
  declarations: [
    InfiniteScrollingDirective
  ]
})
export class InfiniteScrollingModule { }
