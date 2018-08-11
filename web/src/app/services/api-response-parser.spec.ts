import { TestBed, inject } from '@angular/core/testing';
import { APIResponseParser } from "./api-response-parser";


describe("APIResponseParser Class", () => {
    describe("Constructor", () => {
        it("Parsing a response of error = null and payload = []", () => {

            let parser = new APIResponseParser({ error: null, payload: [] })
            
            expect(parser.error).toEqual(null);
            expect(Array.isArray(parser.entities)).toEqual(true);
            expect(parser.entities.length).toEqual(0);
        });
        it("Exception thrown. When we received an error from the API.", () => {
            var b = 
            {
                error: { 
                    message: "-The Object Id '111' is not a valid object Id.", 
                    stack: "at MyService.getErrors:21:19)"
                },
                payload: []
            }

            expect(() => { new APIResponseParser(b) })
                .toThrow({ message: "-The Object Id '111' is not a valid object Id.", stack: "at MyService.getErrors:21:19)" })
        });
        it("No Exception thrown when we received an error from the API but the parameter \"throwAPIErrors\" is set to \"false\".", () => {

            var b = 
            {
                error: { 
                    message: "-The Object Id '111' is not a valid object Id.", 
                    stack: "at MyService.getErrors:21:19)"
                },
                payload: []
            }

            expect((new APIResponseParser(b, false)).error.message).toEqual("-The Object Id '111' is not a valid object Id.");
        });
    });
});

