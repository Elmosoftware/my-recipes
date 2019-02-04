import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import { environment } from "../../environments/environment";
import { Helper } from "../shared/helper";
import { APIResponseParser } from "./api-response-parser";
import { CarouselItem } from "../shared/carousel/carousel.component";
import { homePageCarouselData } from "../static/homePageCarouselData";

@Injectable()
export class MediaService {

  private helper: Helper;

  constructor(private http: HttpClient) {
    this.helper = new Helper();
  }

  /**
   * This method returns async the list an array of picture to be used in the home page carousel.
   * If there is any kind of errors, this method still return a list of alternative pictures stored in the assets image folder.
   */
  getDynamicHomePagePictures(): Observable<object> {
    return this.http.get(this.getUrl("carousel"), { headers: this.buildAPIHeaders() })
      .catch((err) => {
        //This svc must be error safe. So, if the call to the service fail in some way,
        //we can use the alternative site pictures for the Carousel in the assets folder:
        console.warn(`There was an error trying to get dynamic carousel pictures. Falling back to the static ones.`)
        return Observable.of({ error: null, payload: homePageCarouselData.fallbackPictures });
      })
      .map(data => {
        let respData = new APIResponseParser(data, false);

        return this.buildCarouselItems(respData.entities);
      });
  }
  
  private getCaptionsStartIndex(): number {
    return this.helper.getRandomNumberFromInterval(0, homePageCarouselData.captions.length - 1);
  }

  private buildCarouselItems(pictures: any[]): CarouselItem[] {

    let captionIndex: number = this.getCaptionsStartIndex();
    let ret: CarouselItem[] = [];

    pictures.forEach((pic) => {

      let item = new CarouselItem()

      //Carousel image and author crediting:
      item.imageSrc = pic.url

      if (pic.metadata) {
        item.authorName = (pic.metadata.Author) ? pic.metadata.Author : "";
        item.authorURL = (pic.metadata.AuthorURL) ? pic.metadata.AuthorURL : "";
      }

      //Carousel Caption, (text and picture), randomly selected:
      if (captionIndex + 1 > (homePageCarouselData.captions.length - 1)) {
        captionIndex = 0;
      }
      else {
        captionIndex++;
      }

      item.captionImageSrc = homePageCarouselData.captions[captionIndex].img
      item.captionText = homePageCarouselData.captions[captionIndex].text

      ret.push(item);
    })

    return ret;
  }

  /**
 * Assembles the URL to use to call the My Recipes Media API REST Service.
 * @param param Additional params, (like an Object Id)
 */
  private getUrl(functionName: string, param?: string): string {

    if (!param) {
      param = "";
    }

    return `${environment.apiURL}${environment.apiMediaEndpoint}${functionName}/${param}`;
  }

  private buildAPIHeaders(): HttpHeaders {

    let ret: HttpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json");

    return ret;
  }
}
