export const environment = {
  production: true,
  appURL: "https://misrecetas.now.sh",
  apiURL: "https://misrecetas-api.now.sh/api/",
  apiManagementEndpoint: "management/",
  apiMediaEndpoint: "media/",
  authSettings: {
    clientID: 'z2pX8Q7bn1ceLi03OpG11ACfQ2g0xZ2o', //Mis Recetas
    domain: 'elmosoftware.auth0.com',
    audience: 'https://elmosoftware.auth0.com/api/v2/', 
    dbConnection: "Username-Password-Authentication",
    responseType: 'token id_token',
    redirectURI: 'https://misrecetas.now.sh/auth-callback',
    scope: 'openid profile email update:users update:current_user_metadata' //Standard Open ID Claims so calls 
    //to \userinfo endpoint can return user data. Also this allows us to update users data like, metadata, change email, etc.
  },
  contactEmail: "juancarlosgarcia_arg@hotmail.com"
};