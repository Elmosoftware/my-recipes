export class Entity {    
    public _id: string;
    public createdOn: Date;
    public createdBy: string;
    public lastUpdateOn: Date;
    public lastUpdateBy: string;
    public publishedOn: Date;

    constructor(){
        this._id = "";
        this.createdOn = null;
        this.createdBy = "";
        this.lastUpdateOn = null;
        this.lastUpdateBy = "";
        this.publishedOn = null;
    }
}
