import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from "./auth-service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authSvc: AuthService, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    let adminOnly: boolean = (next.data && next.data.authGuard && next.data.authGuard.adminOnly);
    let allowSocialUsers: boolean = (next.data && next.data.authGuard && next.data.authGuard.allowSocialUsers);

    let ret: boolean = true;
    let msg: string = "";

    //This guard requires an authenticated user, if not we will redirect to the login page:
    if (!this.authSvc.isAuthenticated) {
      console.info(`An authenticated user is required to navigate to ${state.url}. Redirecting to login page...`);
      this.authSvc.login(state.url);
    }
    else {

      //If the user is already logged in, we will check for other constraints:

      if (adminOnly && !this.authSvc.userProfile.isAdmin) {
        ret = false;
        msg = `Administrator privileges are required to navigate to ${state.url}`;
      }

      if (allowSocialUsers == false && this.authSvc.userProfile.isSocial) {
        ret = false;
        msg = `Social users are not allowed to navigate to ${state.url}`;
      }

      if (!ret) {
        console.info(msg);
        this.router.navigate(["/error-unauthorized"])
      }
    }

    return ret;
  }
}
