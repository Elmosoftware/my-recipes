
export class Helper {

    constructor(){
    }

    estimatedFriendlyTime(timeInMinutes: number): string{      

        let hours: number = Math.trunc(timeInMinutes/60);
        let mins: number = (hours > 0) ? timeInMinutes - (hours * 60) : timeInMinutes;
        let ret: string = "";

        if (hours > 0) {
            ret += `${hours} hora`;
        }

        if (hours > 1) {
            ret += "s";
        }

        if (hours > 0 && mins > 0) {
            ret += " y ";
        }

        if(mins > 0 || (hours + mins == 0)){
            ret += `${mins} minutos`
        }

        return ret;
    }
}