import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { SubscriptionService } from "./services/subscription.service";
import { ErrorLog } from './model/error-log'

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  constructor(private subs: SubscriptionService) {
  }
  
  handleError(error) {

    var innerErr = null;
    let e = new ErrorLog;
    
    e.location = location.href;
    e.user = "anonymous";
    e.message = (error.message) ? error.message : "";
    e.stack = (error.stack) ? error.stack : ""
    
    //We will do this easy by looking just to the last inner exception of 2, (we don't want mess up with recursivity here :-))
    if (error.error) {
      if (error.error.error) {
        innerErr = error.error.error;
      }
      else {
        innerErr = error.error;
      }
    }

    e.innerException = (typeof innerErr != "string") ? JSON.stringify(innerErr) : innerErr;

    if (error instanceof HttpErrorResponse) {
      e.httpStatus = error.status.toString();
      e.httpStatusText = error.statusText;
      e.url = error.url;
      //If the error is related to some request that went wrong, we note this to the user:
      e.userMessage = "Ocurrió un error de conectividad, reintente la operación en unos minutos."
    }

    console.error(`MyRecipes App unhandled error:\n${JSON.stringify(e)}`);    
    this.subs.emitGlobalErrorEvent(e);
  }
}
