import { Injectable, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

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
    showError(message) {
        this.zone.run(() => {
            this.toastr.error(message, 
                'Ooops!, algo no anduvo bien... :-(');
        });
    }

    /**
     * Shows a success message in a toaster.
     * @param message Message to show in the toaster.
     */
    showSuccess(message) {
        this.zone.run(() => {
            this.toastr.success(message, 
                'Ok!');
        });
    }

    /**
     * Shows an informational message message in a toaster.
     * @param message Message to show in the toaster.
     */
    showInformation(message) {
        this.zone.run(() => {
            this.toastr.info(message, 
                'Info...');
        });
    }

    /**
     * Shows a warning message in a toaster.
     * @param message Message to show in the toaster.
     */
    showWarning(message) {
        this.zone.run(() => {
            this.toastr.warning(message,
                'Atención!');
          });
    }
}