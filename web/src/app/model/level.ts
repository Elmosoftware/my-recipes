import { Entity } from "./entity";

export class Level extends Entity {

    constructor(){
        super();
        this.name = "";
        this.description = "";
    }

    name: string;
    description: string;
}
