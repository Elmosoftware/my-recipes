import { Injectable, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

/**
 * Helper class for the ngx-toastr component.
 * 
 * This facilitates the implementation of the toaster with the same visual aids in all the app.
 */
@Injectable()
export class ToasterHelperService {

    constructor(private zone: NgZone,
        private toastr: ToastrService) {
    }

    /**
     * Shows an error message in a toaster.
     * @param message Message to show in the toaster.
     */
    showError(message, title = 'Ooops!, algo no anduvo bien... :-(') {
        this.zone.run(() => {
            this.toastr.error(message, title);
        });
    }

    /**
     * Shows a success message in a toaster.
     * @param message Message to show in the toaster.
     */
    showSuccess(message, title = 'Ok!') {
        this.zone.run(() => {
            this.toastr.success(message, title);
        });
    }

    /**
     * Shows an informational message message in a toaster.
     * @param message Message to show in the toaster.
     */
    showInformation(message, title ='Info...') {
        this.zone.run(() => {
            this.toastr.info(message, title);
        });
    }

    /**
     * Shows a warning message in a toaster.
     * @param message Message to show in the toaster.
     */
    showWarning(message, title = 'Atención!') {
        this.zone.run(() => {
            this.toastr.warning(message, title);
          });
    }
}