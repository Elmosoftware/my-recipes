import { Injectable, EventEmitter } from '@angular/core';
import { ErrorLog } from '../model/error-log'

@Injectable()
export class SubscriptionService {

  onGlobalError: EventEmitter<ErrorLog> = new EventEmitter();

  constructor() {}
  
  emitGlobalErrorEvent(errorLog) {
    this.onGlobalError.emit(errorLog);
  }

  getGlobalErrorEmitter() {
    return this.onGlobalError;
  }

}
