// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  appURL: "http://localhost:8080",
  apiURL: "http://localhost:3000/api/",
  authSettings: {
    clientID: 'z2pX8Q7bn1ceLi03OpG11ACfQ2g0xZ2o',
    domain: 'elmosoftware.auth0.com',
    audience: 'https://elmosoftware.auth0.com/api/v2/', 
    dbConnection: "Username-Password-Authentication",
    responseType: 'token id_token',
    redirectURI: 'http://localhost:8080/auth-callback',
    scope: 'openid profile email update:users update:current_user_metadata' //Standard Open ID Claims so calls 
    //to \userinfo endpoint can return user data. Also this allows us to update users data like, metadata, change email, etc.
  }
};
