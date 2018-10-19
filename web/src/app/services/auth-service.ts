import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';

import { environment } from "../../environments/environment";
import { APIResponseParser } from "../services/api-response-parser";

(window as any).global = window;

const REFERRER_URL_KEY: string = "AUTH-LOGIN-REFERRER-URL";

/**
 * Authentication and Authorization service
 * @class
 */
@Injectable()
export class AuthService {

  private _managementAPIHTTPOptions = {
    headers: new HttpHeaders()
      .set('Content-Type', 'application/json')
  };

  constructor(public router: Router, private http: HttpClient) {
    this._getAccessToken();
  }

  auth0 = new auth0.WebAuth({
    clientID: environment.authSettings.clientID,
    domain: environment.authSettings.domain,
    responseType: environment.authSettings.responseType,
    redirectUri: environment.authSettings.redirectURI,
    scope: environment.authSettings.scope,
    audience: environment.authSettings.audience
  });

  private _userProfileData: UserProfile

  /**
   * Return the User profile for the authenticated user.
   * If there is no authenticated user, this attribute will return a null value.
   */
  public get userProfile(): UserProfile {
    return this._userProfileData;
  }

  /**
   * Starts the user login process.
   * @param referrerURL The URL to be redirected as soon the authentication process finished. If no value is specified, 
   * the authenticated user will be redirected to the home page.
   */
  public login(referrerURL?: string): void {

    if (referrerURL) {
      localStorage.setItem(REFERRER_URL_KEY, referrerURL);
    }

    this.auth0.authorize();
  }

  /**
   * This method handle the callback request for a log in process.
   * Need to be called from the authorization callback page.
   */
  public handleAuthentication(): void {

    let redirectTo: string = "/home";

    if (localStorage.getItem(REFERRER_URL_KEY)) {
      redirectTo = localStorage.getItem(REFERRER_URL_KEY);
      localStorage.removeItem(REFERRER_URL_KEY);
    }

    this.auth0.parseHash((err, authResult) => {

      if (err) {
        throw err;
      }

      this._getUserInfo(authResult, () => {
        this.router.navigate([redirectTo]);
      });

    });
  }

  /**
   * Ends the current user session.
   * @throws If there is no authenticated user.
   */
  public logout() {

    if (!this.isAuthenticated) {
      throw this._getNotAuthenticatedError("logout");
    }

    //Removing session data:
    this._removeSession();

    // Log out of Auth0 session now.
    // NOTE: Ensure that returnTo URL is specified in Auth0 app settings for "Allowed Logout URLs".
    this.auth0.logout({
      returnTo: environment.appURL,
      clientID: environment.authSettings.clientID
    });
  }

  /**
   * Starts the password reset process with the Auth provider.
   * @param callback Callback function to be invoked when the remote process is already finished.
   */
  public changePassword(callback: Function) {

    if (!this.isAuthenticated) {
      callback(this._getNotAuthenticatedError("password change"));
      return;
    }

    this.auth0.changePassword({
      email: this._userProfileData.email,
      connection: environment.authSettings.dbConnection
    }, (err) => {
      callback(err);
    });
  }

  /**
   * Return the user preferences for current user.
   */
  public getUserPreferences(): UserPreferences {

    if (!this.isAuthenticated) {
      throw this._getNotAuthenticatedError("logout");
    }

    return new UserPreferences(this._userProfileData.name, this._userProfileData.email);
  }

  /**
   * 
   * @param pref New user preferences like, email, name, etc..
   * @param callback Function callback to be invoked as soon the asynchronous process ends. 
   * This function will receive a single parameter with the error details. If this parameter is null or empty 
   * means the update was successful.
   */
  public updateUserPreferences(pref: UserPreferences, callback: Function) {

    let userObj: any = {};
    let dataChanged: boolean = false;

    if (!this.isAuthenticated) {
      callback(this._getNotAuthenticatedError("update user preferences"));
      return;
    }

    //If the user email changed:
    if (pref.email != this._userProfileData.email) {
      userObj.email = pref.email;
      userObj.email_verified = false;
      dataChanged = true;
    }

    //If the user name changed:
    if (pref.name != this._userProfileData.name) {
      if (this._userProfileData.isSocial) {
        userObj.name = pref.name;
      }
      else {
        userObj.user_metadata = { fullName: pref.name };
      }
      dataChanged = true;
    }

    //TODO: This feature to change the user role need to be build as a separate feature.
    // if (pref.isAdmin != this._userProfileData.isAdmin) {
    //   userObj.app_metadata = { role: (pref.isAdmin) ? "ADMIN" : "USER" };
    // }

    if (dataChanged) {
      this.http.put(this._buildManagementAPIURL("user", this._userProfileData.userId), userObj, this._managementAPIHTTPOptions)
        .subscribe((data) => {
          let response: APIResponseParser = new APIResponseParser(data); //If there is an API error, this will throw.  

          this._setSession(null, response.entities);
          callback(true);
        },
          err => {
            throw err
          });
    }
    else {
      callback(true); //If no data was changed, no need to call the API, but we sent a true to the frontend anyway :-)
    }
  }

  /**
   * Returns a boolean value indicating if there is a current authenticated user with a valid session.
   */
  public get isAuthenticated(): boolean {
    return this._userProfileData && this._userProfileData.sessionExpiresAt > new Date();
  }

  /**
   * This method is called once when the app is started.
   * It uses session cookies to refresh the token and continue an previous user session.
   */
  private _getAccessToken() {
    this.auth0.checkSession({}, (err, authResult) => {
      //The Auth service provider is reporting as error if a login is required, so whatever 
      //the case, if there is an error there is no point to get the user info:
      if (!err) {
        this._getUserInfo(authResult);
      }
    });
  }

  /**
   * Return the full user profile based on the authentication data recevived during the log in process.
   * @param authResult Auth process data incuding tokens, expiration and user id.
   */
  private _getUserInfo(authResult, cb?: Function) {

    if (authResult && authResult.idTokenPayload && authResult.idTokenPayload.sub) {

      //Use access token to retrieve user's profile and set session:
      this.http.get(this._buildManagementAPIURL("user", authResult.idTokenPayload.sub), this._managementAPIHTTPOptions)
        .subscribe((data) => {
          let response: APIResponseParser = new APIResponseParser(data); //This will throw if there is an API error

          //Sometimes, (and because the async nature of the auth process), at this point the session and the user profile was 
          //already set. So, we check before to re-create the session twice :-)
          if (!this.isAuthenticated) {
            this._setSession(authResult, response.entities);
          }          

          if (cb) {
            cb();
          }
        },
          err => {
            throw err
          });
    }
    else{
      throw new Error(`The authentication process results provided doesn't contain the user identification data in the ID Token payload.`)
    }
  }

  /**
   * Erase the stored user session and profile data.
   */
  private _removeSession() {
    this._userProfileData = null;
  }

  /**
   * This set the user profile and session data.
   * the parameter @param authResult can be null only if the user session is already established and the intention is to 
   * update the user profile data.
   * Otherwise this method will @throws An error indicating that the @param authResult can't be null.
   * @param authResult Authentication data received afte the authentication 
   * process, (includes tokens, user id, session expiration, etc.)
   * @param profile Full user profile.
   */
  private _setSession(authResult = null, profile) {

    try {
      if (!authResult && !this._userProfileData) {
        throw new Error("You can't establish session data without the authentication tokens.")
      }

      if (!this._userProfileData) {
        this._userProfileData = new UserProfile();
      }

      if (authResult) {
        this._userProfileData.accessToken = authResult.accessToken;
        this._userProfileData.idToken = authResult.idToken;
        this._userProfileData.sessionExpiresAt = new Date((authResult.expiresIn * 1000) + Date.now());
      }

      this._userProfileData.userId = profile.user_id;
      this._userProfileData.isSocial = profile.identities[0].isSocial;
      this._userProfileData.provider = profile.identities[0].provider;
      this._userProfileData.createdAt = profile.created_at;
      this._userProfileData.updatedAt = profile.updated_at;
      this._userProfileData.lastLogin = profile.last_login;
      this._userProfileData.email = profile.email;
      this._userProfileData.emailVerified = profile.email_verified;
      this._userProfileData.picture = profile.picture;

      if (this._userProfileData.isSocial) {
        this._userProfileData.name = profile.name;
      }
      else {
        this._userProfileData.name = profile.user_metadata.fullName
      }

      if (profile.app_metadata) {
        this._userProfileData.isAdmin = (profile.app_metadata.role && profile.app_metadata.role.toLowerCase() == "admin");
      }

      console.log(`User "${this._userProfileData.name}" (${this._userProfileData.email}) successfully logged in. (Session expires at ${this._userProfileData.sessionExpiresAt})`)
    } catch (error) {

      this._removeSession();
      throw new Error(`There was an error while trying to gather the user authentication data. \n
        Following error details: ${error.message}`);
    }
  }

  /**
   * Helper to build the URL for a My Recipes Management API call.
   * @param functionName Management API function name to invoke.
   * @param param URL Param to send.
   */
  private _buildManagementAPIURL(functionName: string, param?: string): string {

    if (!param) {
      param = "";
    }

    return `${environment.apiURL}management/${functionName}/${param}`;
  }

  /**
   * Returns a customized Error object with an error message indicating that the operation will be aborted because there is not an 
   * active user session.
   * @param operation The operation that cause the exception.
   */
  private _getNotAuthenticatedError(operation: string): Error {
    return new Error(`The operation "${operation}" is only available when the user is already authenticated.`)
  }
}

export class UserProfile {

  constructor() {
  }

  userId: string;
  idToken: string;
  accessToken: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  name: string;
  isSocial: boolean;
  picture: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
  sessionExpiresAt: Date;

  get userNameAndAccount(): string {
    return this.name + " (" + this.email + ")."
  }
}

export class UserPreferences {

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }

  name: string;
  email: string;
}

