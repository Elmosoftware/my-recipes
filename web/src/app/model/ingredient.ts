import { Entity } from "./entity";
import { Unit } from "./unit";

export class Ingredient extends Entity {

    constructor(){
        super();
        this.name = "";
        this.compatibleUnits = [];
    }

    name: string;
    compatibleUnits: Unit[];
}
