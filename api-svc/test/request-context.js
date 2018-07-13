//@ts-check

var assert = require("assert");
var RequestContext = require("../request-context")

function getReq(url, method, query) {

  const ret = {
    url: "",
    method: "",
    query: {top: "", skip: "", sort: "", pop: "", filter: ""}
  }
  
  if (url) {
    ret.url = url;
  }

  if (method) {
    ret.method = method;
  }
  
  if (query) {
    ret.query = query;
  }  

  return ret;
}

describe("RequestContext", () => {
  describe("Context for GET /api/units", () => {

    const context = new RequestContext(getReq("/units/", "GET"));

    it("Method is 'GET'", () => {
      assert.equal(context.method, "GET");
    });
    it("Method is allowed", () => {
      assert.equal(context.isMethodAllowed, true);
    });
    it("Entity is in context", () => {
      assert.ok(context.entity);
    });
    it("Model is 'units'", () => {
      assert.equal(context.model.modelName, "UnitOfMeasure");
    });
    it("modelPopulateOpts is and empty string", () => {
      assert.equal(context.modelPopulateOpts, "");
    });
    it("params is an empty array", () => {
      assert.equal(context.params.length, 0);
    });
    it("url is '/units/'", () => {
      assert.equal(context.url, "/units/");
    });
    it("hasQueryParameters is false", () => {
      assert.equal(context.hasQueryParameters, false);
    });
    it("getStatusCode() for Success returns 200", () => {
      assert.equal(context.getStatusCode(null), 200);
    });
    it("getStatusCode() for Error returns 500", () => {
      assert.equal(context.getStatusCode(new Error("Error")), 500);
    });
  });
  describe("Context for GET /api/units/{unit id}", () => {

    const context = new RequestContext(getReq("/units/5a1b55d8ee211d57141ec4fb", "GET"));

    it("Method is 'GET'", () => {
      assert.equal(context.method, "GET");
    });
    it("Method is allowed", () => {
      assert.equal(context.isMethodAllowed, true);
    });
    it("Entity is in context", () => {
      assert.ok(context.entity);
    });
    it("Model is 'units'", () => {
      assert.equal(context.model.modelName, "UnitOfMeasure");
    });
    it("modelPopulateOpts is and empty string", () => {
      assert.equal(context.modelPopulateOpts, "");
    });
    it("params has one single element", () => {
      assert.equal(context.params.length, 1);
    });
    it("params[0] matchs the unit id", () => {
      assert.equal(context.params[0], "5a1b55d8ee211d57141ec4fb");
    });
    it("url is '/units/5a1b55d8ee211d57141ec4fb'", () => {
      assert.equal(context.url, "/units/5a1b55d8ee211d57141ec4fb");
    });
    it("hasQueryParameters is false", () => {
      assert.equal(context.hasQueryParameters, false);
    });
    it("getStatusCode() for Success returns 200", () => {
      assert.equal(context.getStatusCode(null), 200);
    });
    it("getStatusCode() for Error returns 500", () => {
      assert.equal(context.getStatusCode(new Error("Error")), 500);
    });
  });
  describe("Context for GET /api/units/?{query parameters}", () => {
    
    const context = new RequestContext(getReq("/units/?top=10&skip=4&sort=-abbrev name&filter={ '$or' : [ { 'abbrev': 'UNIT07' }, { 'abbrev': 'UNIT12' } ] }", 
      "GET", {top: "10", skip: "4", sort: "-abbrev name", pop: "", 
        filter: "{ '$or' : [ { 'abbrev': 'UNIT07' }, { 'abbrev': 'UNIT12' } ] }"}));

    it("Method is 'GET'", () => {
      assert.equal(context.method, "GET");
    });
    it("Method is allowed", () => {
      assert.equal(context.isMethodAllowed, true);
    });
    it("Entity is in context", () => {
      assert.ok(context.entity);
    });
    it("Model is 'units'", () => {
      assert.equal(context.model.modelName, "UnitOfMeasure");
    });
    it("modelPopulateOpts is an empty string", () => {
      assert.equal(context.modelPopulateOpts, "");
    });
    it("params has no elements", () => {
      assert.equal(context.params.length, 0);
    });
    it("query.top value is right", () => {
      assert.equal(context.query.top, 10);
    });
    it("query.skip value is right", () => {
      assert.equal(context.query.skip, 4);
    });
    it("query.sort value is right", () => {
      assert.equal(context.query.sort, "-abbrev name");
    });
    it("query.pop value is right", () => {
      assert.equal(context.query.pop, "");
    });
    it("query.filter value is right", () => {
      assert.equal(context.query.filter, "{ '$or' : [ { 'abbrev': 'UNIT07' }, { 'abbrev': 'UNIT12' } ] }");
    });
    it("url is '/units/?top=10&skip=4&sort=-abbrev name&filter={ '$or' : [ { 'abbrev': 'UNIT07' }, { 'abbrev': 'UNIT12' } ] }'", () => {
      assert.equal(context.url, "/units/?top=10&skip=4&sort=-abbrev name&filter={ '$or' : [ { 'abbrev': 'UNIT07' }, { 'abbrev': 'UNIT12' } ] }");
    });
    it("hasQueryParameters is true", () => {
      assert.equal(context.hasQueryParameters, true);
    });
    it("filterIsTextSearch is false", () => {
      assert.equal(context.filterIsTextSearch, false);
    });
    it("getStatusCode() for Success returns 200", () => {
      assert.equal(context.getStatusCode(null), 200);
    });
    it("getStatusCode() for Error returns 500", () => {
      assert.equal(context.getStatusCode(new Error("Error")), 500);
    });
  });
  describe("Context for GET /api/units/?{query parameters with full text search filter}", () => {
    
    const context = new RequestContext(getReq(`/units/?top=10&skip=4&sort=-abbrev name&pop=false&filter={"$text":{"$search":"\\"receta\\""}}`, "GET", 
      {top: "10", skip: "4", sort: "-abbrev name", pop:"false", filter:`{"$text":{"$search":"\\"receta\\""}}`}));

    it("Method is 'GET'", () => {
      assert.equal(context.method, "GET");
    });
    it("Method is allowed", () => {
      assert.equal(context.isMethodAllowed, true);
    });
    it("Entity is in context", () => {
      assert.ok(context.entity);
    });
    it("Model is 'units'", () => {
      assert.equal(context.model.modelName, "UnitOfMeasure");
    });
    it("modelPopulateOpts is and empty string", () => {
      assert.equal(context.modelPopulateOpts, "");
    });
    it("params has no elements", () => {
      assert.equal(context.params.length, 0);
    });
    it("query.top value is right", () => {
      assert.equal(context.query.top, 10);
    });
    it("query.skip value is right", () => {
      assert.equal(context.query.skip, 4);
    });
    it("query.sort value is right", () => {
      assert.equal(context.query.sort, "-abbrev name");
    });
    it("query.pop value is right", () => {
      assert.equal(context.query.pop, "false");
    });
    it("query.filter value is right", () => {
      assert.equal(context.query.filter, `{"$text":{"$search":"\\"receta\\""}}`);
    });
    it(`url is: /units/?top=10&skip=4&sort=-abbrev name&pop=false&filter={"$text":{"$search":"\\"receta\\""}}`  , () => {
      assert.equal(context.url, `/units/?top=10&skip=4&sort=-abbrev name&pop=false&filter={"$text":{"$search":"\\"receta\\""}}`);
    });
    it("hasQueryParameters is true", () => {
      assert.equal(context.hasQueryParameters, true);
    });
    it("filterIsTextSearch is true", () => {
      assert.equal(context.filterIsTextSearch, true);
    });
    it("getStatusCode() for Success returns 200", () => {
      assert.equal(context.getStatusCode(null), 200);
    });
    it("getStatusCode() for Error returns 500", () => {
      assert.equal(context.getStatusCode(new Error("Error")), 500);
    });
  });
  describe("Context for POST /api/units", () => {
    
    const context = new RequestContext(getReq("/units/", "POST"));

    it("Method is 'POST'", () => {
      assert.equal(context.method, "POST");
    });
    it("Method is allowed", () => {
      assert.equal(context.isMethodAllowed, true);
    });
    it("Entity is in context", () => {
      assert.ok(context.entity);
    });
    it("Model is 'units'", () => {
      assert.equal(context.model.modelName, "UnitOfMeasure");
    });
    it("modelPopulateOpts is an empty string", () => {
      assert.equal(context.modelPopulateOpts, "");
    });
    it("params is an empty array", () => {
      assert.equal(context.params.length, 0);
    });
    it("url is '/units/'", () => {
      assert.equal(context.url, "/units/");
    });
    it("hasQueryParameters is false", () => {
      assert.equal(context.hasQueryParameters, false);
    });
    it("getStatusCode() for Success returns 201", () => {
      assert.equal(context.getStatusCode(null), 201);
    });
    it("getStatusCode() for Error returns 500", () => {
      assert.equal(context.getStatusCode(new Error("Error")), 500);
    });
  });
  describe("Context for PUT /api/units", () => {

    const context = new RequestContext(getReq("/units/", "PUT"));

    it("Method is 'PUT'", () => {
      assert.equal(context.method, "PUT");
    });
    it("Method is allowed", () => {
      assert.equal(context.isMethodAllowed, true);
    });
    it("Entity is in context", () => {
      assert.ok(context.entity);
    });
    it("Model is 'units'", () => {
      assert.equal(context.model.modelName, "UnitOfMeasure");
    });
    it("modelPopulateOpts is an empty string", () => {
      assert.equal(context.modelPopulateOpts, "");
    });
    it("params is an empty array", () => {
      assert.equal(context.params.length, 0);
    });
    it("url is '/units/'", () => {
      assert.equal(context.url, "/units/");
    });
    it("hasQueryParameters is false", () => {
      assert.equal(context.hasQueryParameters, false);
    });
    it("getStatusCode() for Success returns 200", () => {
      assert.equal(context.getStatusCode(null), 200);
    });
    it("getStatusCode() for Error returns 422", () => {
      assert.equal(context.getStatusCode(new Error("Error")), 422);
    });
  });
  describe("Context for PUT /api/units/{unit id}", () => {

    const context = new RequestContext(getReq("/units/5a1b55d8ee211d57141ec4fb", "PUT"));

    it("Method is 'PUT'", () => {
      assert.equal(context.method, "PUT");
    });
    it("Method is allowed", () => {
      assert.equal(context.isMethodAllowed, true);
    });
    it("Entity is in context", () => {
      assert.ok(context.entity);
    });
    it("Model is 'units'", () => {
      assert.equal(context.model.modelName, "UnitOfMeasure");
    });
    it("modelPopulateOpts is and empty string", () => {
      assert.equal(context.modelPopulateOpts, "");
    });
    it("params has one single element", () => {
      assert.equal(context.params.length, 1);
    });
    it("params[0] matchs the unit id", () => {
      assert.equal(context.params[0], "5a1b55d8ee211d57141ec4fb");
    });
    it("url is '/units/5a1b55d8ee211d57141ec4fb'", () => {
      assert.equal(context.url, "/units/5a1b55d8ee211d57141ec4fb");
    });
    it("hasQueryParameters is false", () => {
      assert.equal(context.hasQueryParameters, false);
    });
    it("getStatusCode() for Success returns 200", () => {
      assert.equal(context.getStatusCode(null), 200);
    });
    it("getStatusCode() for Error returns 422", () => {
      assert.equal(context.getStatusCode(new Error("Error")), 422);
    });
  });
  describe("Context for DELETE /api/units/{unit id}", () => {

    const context = new RequestContext(getReq("/units/5a1b55d8ee211d57141ec4fb", "DELETE"));

    it("Method is 'DELETE'", () => {
      assert.equal(context.method, "DELETE");
    });
    it("Method is allowed", () => {
      assert.equal(context.isMethodAllowed, true);
    });
    it("Entity is in context", () => {
      assert.ok(context.entity);
    });
    it("Model is 'units'", () => {
      assert.equal(context.model.modelName, "UnitOfMeasure");
    });
    it("modelPopulateOpts is and empty string", () => {
      assert.equal(context.modelPopulateOpts, "");
    });
    it("params has one single element", () => {
      assert.equal(context.params.length, 1);
    });
    it("params[0] matchs the unit id", () => {
      assert.equal(context.params[0], "5a1b55d8ee211d57141ec4fb");
    });
    it("url is '/units/5a1b55d8ee211d57141ec4fb'", () => {
      assert.equal(context.url, "/units/5a1b55d8ee211d57141ec4fb");
    });
    it("hasQueryParameters is false", () => {
      assert.equal(context.hasQueryParameters, false);
    });
    it("getStatusCode() for Success returns 200", () => {
      assert.equal(context.getStatusCode(null), 200);
    });
    it("getStatusCode() for Error returns 422", () => {
      assert.equal(context.getStatusCode(new Error("Error")), 422);
    });
  });
  describe("Context for {NOT ALLOWED METHOD} /api/units/", () => {

    const context = new RequestContext(getReq("/units/", "NOTALLOWEDMETHOD"));

    it("Method is 'NOTALLOWEDMETHOD'", () => {
      assert.equal(context.method, "NOTALLOWEDMETHOD");
    });
    it("Method is NOT allowed", () => {
      assert.equal(context.isMethodAllowed, false);
    });
    it("Entity is in context", () => {
      assert.ok(context.entity);
    });
    it("Model is 'units'", () => {
      assert.equal(context.model.modelName, "UnitOfMeasure");
    });
    it("modelPopulateOpts is and empty string", () => {
      assert.equal(context.modelPopulateOpts, "");
    });
    it("params has no elements", () => {
      assert.equal(context.params.length, 0);
    });
    it("url is '/units/'", () => {
      assert.equal(context.url, "/units/");
    });
    it("hasQueryParameters is false", () => {
      assert.equal(context.hasQueryParameters, false);
    });
    it("getStatusCode() for Success returns 405", () => {
      assert.equal(context.getStatusCode(null), 405);
    });
    it("getStatusCode() for Error returns 405", () => {
      assert.equal(context.getStatusCode(new Error("Error")), 405);
    });
  });
});

