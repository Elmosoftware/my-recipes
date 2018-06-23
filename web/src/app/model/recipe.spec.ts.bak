import { TestBed, inject } from '@angular/core/testing';
import { Recipe } from "./recipe";

function getRecipeWithTime(minutes: number) {
    let ret: Recipe;

    ret = new Recipe();
    ret.estimatedTime = minutes;

    return ret;
}
describe("Recipe Class", () => {
    describe("EstimatedFriendlyTime", () => {
        it("Must return '0 minutos' when value is 0", () => {
            expect(getRecipeWithTime(0).estimatedFriendlyTime).toBe("0 minutos");
        });
        it("Must return '30 minutos' when value is 30", () => {
            expect(getRecipeWithTime(30).estimatedFriendlyTime).toBe("30 minutos");
        });
        it("Must return '1 hora' when value is 60", () => {
            expect(getRecipeWithTime(60).estimatedFriendlyTime).toBe("1 hora");
        });
        it("Must return '1 hora y 30 minutos' when value is 90", () => {
            expect(getRecipeWithTime(90).estimatedFriendlyTime).toBe("1 hora y 30 minutos");
        });
        it("Must return '2 horas' when value is 120", () => {
            expect(getRecipeWithTime(120).estimatedFriendlyTime).toBe("2 horas");
        });
        it("Must return '2 horas y 30 minutos' when value is 150", () => {
            expect(getRecipeWithTime(150).estimatedFriendlyTime).toBe("2 horas y 30 minutos");
        });
        it("Must return '3 horas' when value is 180", () => {
            expect(getRecipeWithTime(180).estimatedFriendlyTime).toBe("3 horas");
        });
    });
});

