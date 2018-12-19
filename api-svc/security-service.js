/**
 * Enumeration holding the possible access types to this API. 
 */
const ACCESS_TYPE = Object.freeze({
    READ: 'READ',
    WRITE: "WRITE",
    DELETE: "DELETE"
});

/**
 * Enumeration holding the Access granted targets.
 */
const ACCESS_PRIVILEGES = Object.freeze({
    ANONYMOUS: 'ANONYMOUS',
    AUTHENTICATED: 'AUTHENTICATED',
    OWNER: 'OWNER',
    ADMINISTRATORS: 'ADMINISTRATORS'
});

/**
 * This class responsibility is to secure API Access inthe following ways:
 *  - Resolve if an access is valid.
 *  - Add or create filter conditions specific to application security and integrity.
 */
class SecurityService {

    constructor() {
    }

    /**
     * Returns an empty string if the access is allowed. otherwise return the access violation details.
     * @param {ACCESS_TYPE} accessType Requested access type, (like read, update, etc.) 
     * @param {object} entity Entity object
     * @param {object} user RequestContext.user object
     * @param {object} query RequestContext.query object
     */
    validateAccessRequest(accessType, entity, user = null, query = null) {
        let ret = "";
        let isNotPubAccess = Boolean(query && query.pub && ["all", "notpub"].includes(String(query.pub).toLowerCase()));

        this._checkAccessTypeParam(accessType);
        this._checkEntityParam(entity);

        switch (accessType) {
            case ACCESS_TYPE.READ:
                //Only the read access to not published entities is restricted, so we will check only that condition:
                if (isNotPubAccess && !this._validatePrivileges(entity.readNotPublishedPrivilege, user)) {
                    ret = `Not published "${entity.name}" can be accessed ONLY by users granted as "${entity.readNotPublishedPrivilege}".`
                }
                break;
            case ACCESS_TYPE.WRITE:
                if (!this._validatePrivileges(entity.writePrivileges, user)) {
                    ret = `Entities of type "${entity.name}" can be created or updated ONLY by authenticated users granted as "${entity.readNotPublishedPrivilege}".`
                }
                break;
            case ACCESS_TYPE.DELETE:
                if (!this._validatePrivileges(entity.deletePrivileges, user)) {
                    ret = `Entities of type "${entity.name}" can be deleted ONLY by authenticated users granted as "${entity.readNotPublishedPrivilege}".`
                }
                break;
            default:
                throw new Error(`There is no action defined for an ACCESS_TYPE with value "${accessType}".`)
        }

        if (ret) {
            ret = "[ACCESS VIOLATION]: " + ret;
        }

        return ret;
    }

    /**
     * Update the provided filter conditions object by adding specific data integrity and security filters.
     * @param {ACCESS_TYPE} accessType Requested Access Type.
     * @param {object} conditionsObject Filter conditions object.
     * @param {object} entity Entity object. 
     * @param {object} user RequestContext.user object
     * @param {object} query RequestContext.query object.  
     */
    updateQueryFilterWithSecurityConstraints(accessType, conditionsObject, entity, user = null, query = null){

        let restrictOwnerOnly = false;
        let isNotPubAccess;
        let isIdFilter;

        this._checkAccessTypeParam(accessType);
        this._checkConditionsObjectParam(conditionsObject);
        this._checkEntityParam(entity);

        //This flag indicates if we are trying to query one single document by his id:
        isIdFilter = Boolean(conditionsObject && conditionsObject._id);
        //This flag indicates if we are attempting to retrieve multiple documents and some of them can be not published:
        isNotPubAccess = Boolean(query && query.pub && ["all", "notpub"].includes(String(query.pub).toLowerCase()));
        
        switch (accessType) {
            case ACCESS_TYPE.READ:
                //If we are trying to access one single documet that maybe is not published or we are trying to 
                //fetch multiple documents that can include not published, and the security restriction for the entity indicates
                //that "only the owner can access not published documents. We need to add the ownership condition to the filter:
                restrictOwnerOnly = (isNotPubAccess || isIdFilter) && entity.readNotPublishedPrivilege == ACCESS_PRIVILEGES.OWNER;
                break;
            case ACCESS_TYPE.WRITE:
                //If we try to update an entity granted only to his Owner:
                restrictOwnerOnly = entity.writePrivileges == ACCESS_PRIVILEGES.OWNER;
                break;
            case ACCESS_TYPE.DELETE:
                //If only the owner can delete an entity:
                restrictOwnerOnly = entity.writePrivileges == ACCESS_PRIVILEGES.OWNER;
                break;
            default:
                throw new Error(`There is no action defined for an ACCESS_TYPE with value "${accessType}".`)
        }

        //If we need to ensure that only the Owner can access or modify the document:
        if (restrictOwnerOnly) {
            //If the query conditions attempt to retrieve one single document by his id:
            if (isIdFilter) {
                //If there is an authenticated user:
                if (user && user.id) {
                    //We will grant access only to owners at least the document is already published:
                    conditionsObject.$or = [
                        { publishedOn: { $ne: null } },
                        { lastUpdateBy: user.id },
                        { createdBy: user.id }]
                }
                else {
                    //If there is no authenticated user: He can only be able to access Published documents :-(
                    conditionsObject.publishedOn = { $ne: null }
                }
            }
            //If the query conditions attempts to fetch multiple documents:
            else {
                if (!conditionsObject.$and) {
                    conditionsObject.$and = new Array();
                }
                conditionsObject.$and.push(this.getOnlyOwnerAccessCondition(user));
            }
        }
    }

    /**
     * Return a filter condition required to return only documents owned by the provided user.
     * @param {object} user RequestContext.user object
     */
    getOnlyOwnerAccessCondition(user){
        this._checkUserParam(user);
        return { $or: [{ lastUpdateBy: user.id }, { createdBy: user.id }] };
    }

    //#region Private Members

    _validatePrivileges(accessPrivileges, user){
        
        let ret = false;

        this._checkAccessPrivilegesParam(accessPrivileges);

        switch (accessPrivileges) {
            case ACCESS_PRIVILEGES.ANONYMOUS:
                ret = true;
                break;
            case ACCESS_PRIVILEGES.AUTHENTICATED:
                ret = Boolean(user);
                break;
            case ACCESS_PRIVILEGES.OWNER:
                //We will return "true" here always there is a valid user, because we are not able to validate if the user is the 
                //Owner without to access the Database.
                //This will be handled later by adding a DB filter conditions to que query in order to enforce this rule.
                ret = Boolean(user);
                break;
            case ACCESS_PRIVILEGES.ADMINISTRATORS:
                ret = (user && user.isAdmin)
                break;
            default:
                throw new Error(`There is no action defined for an ACCESS_PRIVILEGES with value "${accessPrivileges}".`)
        }           

        return ret;
    }    

    _checkAccessTypeParam(accessType){

        let ret = "";

        if (!(typeof accessType === "string")) {
            ret = `We expected a String for parameter "accessType" and we get a type of '${typeof accessType}'.`;
        }
        else if (!Object.getOwnPropertyNames(ACCESS_TYPE).includes(accessType)) {
            ret = `Invalid value for parameter "accessType". Provided value is "${accessType}".
                Valid values are: ${Object.getOwnPropertyNames(ACCESS_TYPE).join(", ")}`
        }
       
        if (ret) {
            throw new Error(ret);
        }
    }

    _checkAccessPrivilegesParam(accessPrivileges){

        let ret = "";

        if (!(typeof accessPrivileges === "string")) {
            ret = `We expected a String for parameter "accessPrivileges" and we get a type of '${typeof accessPrivileges}'.`;
        }
        else if (!Object.getOwnPropertyNames(ACCESS_PRIVILEGES).includes(accessPrivileges)) {
            ret = `Invalid value for parameter "accessPrivileges". Provided value is "${accessPrivileges}".
                Valid values are: ${Object.getOwnPropertyNames(ACCESS_PRIVILEGES).join(", ")}`
        }
       
        if (ret) {
            throw new Error(ret);
        }
    }

    _checkEntityParam(entity){

        let ret = "";
        
        if (!entity) {
            ret = `The parameter "entity" can't be null or empty. Parameter value: '${entity}'.`;
        }
        else if (!(entity === Object(entity))) {
            ret = `We expected an Object for parameter "entity" and we get a type of '${typeof entity}'.`;
        }
        else if (!entity.name) {
            ret = `The property "name" of the provided Entity is null or undefined.`;
        }

        if (ret) {
            throw new Error(ret);
        }
    }

    _checkConditionsObjectParam(conditionsObject){

        let ret = "";

        if (!(conditionsObject === Object(conditionsObject))) {
            ret = `We expected an Object for parameter "conditionsObject" and we get a type of '${typeof conditionsObject}'.`;
        }
        
        if (ret) {
            throw new Error(ret);
        }
    }

    _checkUserParam(user){

        let ret = "";

        if (!(user === Object(user))) {
            ret = `We expected an Object for parameter "user" and we get a type of '${typeof user}'.`;
        }
        else if (!(user.id && user.isAdmin === Boolean(user.isAdmin))) {
            ret = `The attributes "id" and "isAdmin" of the "user" provided parameter seems to be missing.`;
        }
        
        if (ret) {
            throw new Error(ret);
        }
    }
    //#endregion
}

module.exports = { SecurityService, ACCESS_TYPE, ACCESS_PRIVILEGES }