import { Entity } from "./entity";

export class ErrorLog extends Entity {

    constructor() {
        super();
        this.timestamp = new Date().toISOString();
        this.user = "anonymous"
    }

    timestamp: string = "";
    location: string = "";
    url: string = "";
    user: string = "";
    httpStatus: string = "";
    httpStatusText: string = "";
    message: string = "";
    userMessage: string = "";
    innerException: string = "";
    stack: string = "";

    getUserMessage(): string{
        return (this.userMessage) ? this.userMessage : 
            "Reintente luego, y si este error persiste contacte al equipo de soporte.";
    }
}
