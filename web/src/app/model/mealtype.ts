import { Entity } from "./entity";

export class MealType extends Entity {

    constructor(){
        super();
        this.name = "";
        this.description = "";
    }

    name: string;
    description: string;
}
