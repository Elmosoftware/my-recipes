import { NgZone } from "@angular/core";

declare var $: any; //jQuery

export class Helper {

    constructor() {
    }

    /**
     * Return the specified time in a user friendly format.
     * @example If the param timeInMinutes has the value 90. Thi function wil return: "1 hora y 30 minutos".
     * @param timeInMinutes Time in minutes
     */
    estimatedFriendlyTime(timeInMinutes: number): string {

        let hours: number = Math.trunc(timeInMinutes / 60);
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

        if (mins > 0 || (hours + mins == 0)) {
            ret += `${mins} minutos`
        }

        return ret;
    }

    /**
     * Sadly, sometimes tooltips are not working as expected and still visible when navigatng to a different path or removing 
     * from the DOM the element that is holding the tooltip. So, the workaround remove them manually.
     * 
     * When you call this method, any tooltip displayed will disappear until next hover or click over the element.
     * @param zone Angular zone where to run the  invocation.
     */
    removeTooltips(zone: NgZone) {
        zone.runOutsideAngular(() => {
            $("div[role=tooltip]").remove();
        })
    }

    getShortText(text: string, startPosition: number = 0, maxLength: number = 150, posfix: string = "&hellip;") {
        return (text && text.length > maxLength) ? text.substr(startPosition, maxLength - 1) + '&hellip;' : text;
    }
}