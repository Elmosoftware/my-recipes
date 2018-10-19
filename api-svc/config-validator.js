//@ts-check

const ValidatorBase = require("./validator-base");

class ConfigValidator extends ValidatorBase {

    constructor() {
        super();
    }

    validateConfig() {
    
        //NODE_ENV is required and can be only one of the following values "dev", "prod":
        if (!process.env.NODE_ENV || !(process.env.NODE_ENV == "dev" || process.env.NODE_ENV == "prod")) {
            super._addError("NODE_ENV is required and can be only one of the following values: 'dev', 'prod'");
        }
    
        // //PORT configuration is required and must be a valid port number:
        // if(process.env.PORT && (isNaN(Number(process.env.PORT)) || Number(process.env.PORT) < 0 || 
        //         Number(process.env.PORT) > 65535)){
        //     super._addError("PORT is not a number or is out of the range of valid port numbers, (0 to 65535)");
        // }
        
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
        
        return this;
    }
}

module.exports = ConfigValidator;
