import { Component, OnInit } from '@angular/core';

import { AuthService, UserPreferences } from "../services/auth-service";
import { ToasterHelperService } from "../services/toaster-helper-service";

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.css']
})
export class UserPreferencesComponent implements OnInit {

  constructor(private authSvc: AuthService, private toastSvc: ToasterHelperService) { }

  model: UserPreferences;
  emailConfirmation: string = "";

  ngOnInit() {
    this.model = this.authSvc.getUserPreferences();
  }

  save(){
    this.authSvc.updateUserPreferences(this.model, (result) => {
      if (result) {
        this.toastSvc.showSuccess("Tus preferencias han sido modificadas con éxito!")
      }
      //Any error is handled by the service.
    })
  }

}
