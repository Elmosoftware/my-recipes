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
    let ret: boolean = false;

    //This guard requires an authenticated user, if not we will redirect to the login page:
    if (!this.authSvc.isAuthenticated) {
      console.info(`An authenticated user is required to navigate to ${state.url}. Redirecting to login page...`);
      this.authSvc.login(state.url);
    }
    else {
      ret = true;

      if(adminOnly){
        ret = this.authSvc.userProfile.isAdmin;
        
        if (!ret) {
          console.info(`Administrator privileges are required to navigate to ${state.url}`);
          this.router.navigate(["/error-unauthorized"]) 
        }
      }
    }

    return ret;
  }
}
