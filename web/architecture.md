#My Recipes Architecture details



##User Management

We are using an authentication and authorization management provider "Auth0":
[Auth0](https://manage.auth0.com/welcome/)
login with juancarlosgarcia_arg@hotmail.com

Following Apps created:

 - **Mis Recetas Stage**: Intended for testing.
 - **Mis Recetas**: Intended for Production, (not created yet).

##Testing users:
For "My Recipes stage" app we are using [Zoho Email](https://www.zoho.eu/mail/)     
with the following accounts:

###Account 01:
*IS SOCIAL ACCOUNT*: No
*Email Account*: mr_stage_test01@zoho.eu
*Email Pass*: Stage-test01-email    
*Email Account (alternative)*: mr_stage_test01_alt@zoho.eu  (please use this email account to test an email account change).
*Email Pass*: Stage-test01-email-alt
*user_metadata.fullName*: Test User
*Role*: admin    
*Login Pass*: Stage-test01
*Login Pass (alternative)*: Stage-test01-testpass    (please, use this password if you want to test a pasword change).

###Account 02:
*IS SOCIAL ACCOUNT*: Yes
*Email Account*: onlycrapforme@gmail.com
*Email Pass*: gargaralarga
*name*: Only Crap
*Role*: user

##Pending to check:
-Configuration management (Using NOW).
-Record a FREE domain name.
-Configure an email provider in Auth0 so we can modify email templates.
-How to configure .env file for ProD on API
-How to create a certificate for the site.
-How to create a different Project for prod in AUTH0
-How to create a Cloud instance of Mongo for Prod env.  

