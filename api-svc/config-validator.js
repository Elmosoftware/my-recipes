//@ts-check

const ValidatorBase = require("./validator-base");

/**
 * This  class provides a method to validate .env config file.
 * @extends ValidatorBase
 */
class ConfigValidator extends ValidatorBase {

    constructor() {
        super();
    }

    /**
     * Validates the .env Config file after been loaded.
     */
    validateConfig() {

        let validEnvValues = ["development", "production"];
    
        //NODE_ENV is required and can be only one of the following values "dev", "prod":
        if (!process.env.NODE_ENV || !validEnvValues.includes(process.env.NODE_ENV)) {
            super._addError(`NODE_ENV is missing or it has an invalid value.
            Current value is: "${(process.env.NODE_ENV) ? process.env.NODE_ENV : "null or undefined"}".
            Possible values are: ${validEnvValues.join(", ")}.`);
        }
    
        //DB_ENDPOINT is required and can't be null or empty:
        if(!process.env.DB_ENDPOINT){
            super._addError("DB_ENDPOINT is required and can't be null or empty.");
        }
    
        //REQUESTS_ADDED_DELAY if specified must be a number greater or equal to 0 and less than max 32bit integer value.
        if(process.env.REQUESTS_ADDED_DELAY && (isNaN(Number(process.env.REQUESTS_ADDED_DELAY)) || Number(process.env.REQUESTS_ADDED_DELAY) < 0 || 
                Number(process.env.REQUESTS_ADDED_DELAY) >= 2147483647)){
                    super._addError("REQUESTS_ADDED_DELAY is not a number or is out of the range of valid delay time in milliseconds, (0 to Max 32bit integer value)");
        }

        //AUTHMANAGEMENT_DOMAIN is required and can't be null or empty:
        if(!process.env.AUTHMANAGEMENT_DOMAIN){
            super._addError("AUTHMANAGEMENT_DOMAIN is required and can't be null or empty.");
        }

        //AUTHMANAGEMENT_CLIENT_ID is required and can't be null or empty:
        if(!process.env.AUTHMANAGEMENT_CLIENT_ID){
            super._addError("AUTHMANAGEMENT_CLIENT_ID is required and can't be null or empty.");
        }

        //AUTHMANAGEMENT_CLIENT_SECRET is required and can't be null or empty:
        if(!process.env.AUTHMANAGEMENT_CLIENT_SECRET){
            super._addError("AUTHMANAGEMENT_CLIENT_SECRET is required and can't be null or empty.");
        }

        //AUTHMANAGEMENT_SCOPE is required and can't be null or empty:
        if(!process.env.AUTHMANAGEMENT_SCOPE){
            super._addError("AUTHMANAGEMENT_SCOPE is required and can't be null or empty.");
        }

        //CDN_CLOUD_NAME is required and can't be null or empty:
        if(!process.env.CDN_CLOUD_NAME){
            super._addError("CDN_CLOUD_NAME is required and can't be null or empty.");
        }

        //CDN_API_KEY is required and can't be null or empty:
        if(!process.env.CDN_API_KEY){
            super._addError("CDN_API_KEY is required and can't be null or empty.");
        }

        //CDN_API_SECRET is required and can't be null or empty:
        if(!process.env.CDN_API_SECRET){
            super._addError("CDN_API_SECRET is required and can't be null or empty.");
        }

        //CDN_CAROUSEL_PREFIX is required and can't be null or empty:
        if(!process.env.CDN_CAROUSEL_PREFIX){
            super._addError("CDN_CAROUSEL_PREFIX is required and can't be null or empty.");
        }

        //CDN_CAROUSEL_SUBFOLDERS must be a number greater than 0 and less than max 32bit integer value.
        if(isNaN(Number(process.env.CDN_CAROUSEL_SUBFOLDERS)) || Number(process.env.CDN_CAROUSEL_SUBFOLDERS) < 1 || 
                Number(process.env.CDN_CAROUSEL_SUBFOLDERS) >= 255){
                    super._addError("CDN_CAROUSEL_SUBFOLDERS is not a number or is out of range, (Valid range is 1 to 255)");
        }

        return this;
    }
}

module.exports = ConfigValidator;
