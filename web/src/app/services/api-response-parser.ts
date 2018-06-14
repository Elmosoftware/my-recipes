import { Entity } from "../model/entity";

/**
 * This class helps parsing the My Recipes API response body.
 */
export class APIResponseParser {

    /**
     * Set the parser.
     * @param responseData The response body from a call to any of the MyRecipes API function. 
     * @param throwAPIErrors A boolean value indicating if the errors reported by the API will be thrown. The default value is "true".
     */
    constructor(responseData:any, throwAPIErrors: boolean = true){
        let e: Error = null;

        try {
            this.error = JSON.parse(responseData.error);
            this.entities = JSON.parse(responseData.payload);
        } catch (error) {
            e = new Error(`There was an error parsing the API response data.\n${error}`)
            e.stack = error.stack
            throw e;            
        } 

        if (this.error && throwAPIErrors) {
            throw this.error;
        }        
    }

    /**
     * The error returned by the API call or "null" in case there was no errors.
     */
    error: Error | null;

    /**
     * API call payload.
     */
    entities: Entity[];
}