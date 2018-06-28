import { NgZone } from "@angular/core";

declare var $: any; //jQuery

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

    removeTooltips(zone: NgZone){
        //Sadly, sometime tooltips are not workinga expected and still visible when navigatng or removing the DOM element that hold them.
        //So, what we need to do is to remove them manually.
        zone.runOutsideAngular(() => {
          $("div[role=tooltip]").remove();
        })
      }
}