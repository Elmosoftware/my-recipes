import { Component, OnChanges, OnInit, AfterViewInit, Input } from '@angular/core';
import { trigger, state, animate, transition, style } from '@angular/animations';
import { Router } from '@angular/router';

import { StandardDialogService, ConfirmDialogConfiguration } from "../standard-dialogs/standard-dialog.service";
import { SearchService, SEARCH_TYPE } from "../services/search-service";
import { AuthService } from "../services/auth-service";
import { ToasterHelperService } from "../services/toaster-helper-service";

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

  constructor(private router: Router,
    public authSvc: AuthService,
    private toastrSvc: ToasterHelperService,
    private dlgSvc: StandardDialogService) {
  }

  ngOnInit() {
    this.isVisible = true;
  }

  onScrollHandler($event: number) {
    this.isVisible = (isNaN($event) || $event < 1);
  }

  get isAdminUser() : boolean {
    return this.authSvc.isAuthenticated && this.authSvc.userProfile.isAdmin;
  }

  onSearchHandler($event: SearchService) {
    $event.search();
  }

  login() {
    this.authSvc.login();
  }

  changePassword() {

    this.dlgSvc.showConfirmDialog(new ConfirmDialogConfiguration("Confirmación de cambio de contraseña",
      `Si confirmas tu intención de cambiar tu contraseña de acceso, se te enviará un correo 
      a <i>${this.authSvc.userProfile.email}</i> con las instrucciones detalladas para crear tu nueva contraseña.
      <p>Recuerda que el mensaje de cambio de contraseña tiene un tiempo de validez, pasado el cual, el correo
       ya no será válido y deberás volver a iniciar el proceso.</p>`,
      "Si, deseo cambiar mi contraseña", "No, continuaré con la actual")).subscribe(result => {

        if (result == 1) {
          this.authSvc.changePassword((err) => {
            if (err) {
              throw err;
            }
            else {
              this.toastrSvc.showInformation("Verifica la bandeja de entrada de tu correo y sigue las instrucciones para cambiar tu contraseña.", "Todo ha ido bien!")
            }
          });
        }
      }, err => {
        throw err
      });
  }

  userPreferences(name: string) {
    this.router.navigate(['/user-preferences']);
  }

  logout() {
    this.authSvc.logout();
  }
}
