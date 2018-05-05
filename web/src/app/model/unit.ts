import { Entity } from "./entity";

export class Unit extends Entity {

    constructor(){
        super();
        this.abbrev = "";
        this.name = "";
    }

    abbrev: string;
    name: string;
}
