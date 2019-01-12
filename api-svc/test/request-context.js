//@ts-check

var assert = require("assert");
var Context = require("../request-context")
var req;
var res;
var context;
var defaultRequestContextOptions = new Context.RequestContextOptions(true, true, true, true);

class ResponseMock {

  constructor() {
    this.setHeaderCalled = false;
    this.statusSent = null;
    this.jsonSent = "";
  }

  setHeader(key, val) {
    this.setHeaderCalled = true;
    return this;
  }

  status(status) {
    this.statusSent = status;
    return this;
  }

  json(data) {
    this.jsonSent = JSON.stringify(data);
    return this;
  }

  get results() {
    return {
      headerWasSet: this.setHeaderCalled,
      statusCodeWasSent: this.statusSent,
      responseWasSent: this.jsonSent
    }
  }
}

function getReq(url, method, query, user) {

  const ret = {
    url: "",
    method: "",
    query: { top: "", skip: "", sort: "", pop: "", filter: "", pub: "", owner:"" },
    user: { rawData: null, id: "", isAdmin: false }
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

  ret.user = user; //This can be null.

  return ret;
}

describe("RequestContext (disabling all Request Context Options)", () => {
  describe("Context for GET /api/units", () => {

    beforeEach((done) => {
      req = getReq("/units/", "GET");
      res = new ResponseMock();
      context = new Context.RequestContext(req, res, defaultRequestContextOptions);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers were not set", () => {
      assert.equal(res.results.headerWasSet, false);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
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
      assert.equal(context.model.modelName, "Unit");
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
    it("user is null", () => {
      assert.equal(context.user, null);
    });
    it("isauthenticated is false", () => {
      assert.equal(context.isAuthenticated, false);
    });
  });
  describe("Context for GET /api/units/{unit id}", () => {

    beforeEach((done) => {
      req = getReq("/units/5a1b55d8ee211d57141ec4fb", "GET");
      res = new ResponseMock();
      context = new Context.RequestContext(req, res, defaultRequestContextOptions);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers were not set", () => {
      assert.equal(res.results.headerWasSet, false);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
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
      assert.equal(context.model.modelName, "Unit");
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
    it("user is null", () => {
      assert.equal(context.user, null);
    });
    it("isauthenticated is false", () => {
      assert.equal(context.isAuthenticated, false);
    });
  });
  describe("Context for GET /api/units/?{query parameters}", () => {

    beforeEach((done) => {
      req = getReq("/units/?top=10&skip=4&sort=-abbrev name&filter={ '$or' : [ { 'abbrev': 'UNIT07' }, { 'abbrev': 'UNIT12' } ] }",
        "GET",
        {
          top: "10", skip: "4", sort: "-abbrev name", pop: "",
          filter: "{ '$or' : [ { 'abbrev': 'UNIT07' }, { 'abbrev': 'UNIT12' } ] }"
        });
      res = new ResponseMock();
      context = new Context.RequestContext(req, res, defaultRequestContextOptions);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers were not set", () => {
      assert.equal(res.results.headerWasSet, false);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
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
      assert.equal(context.model.modelName, "Unit");
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
    it("user is null", () => {
      assert.equal(context.user, null);
    });
    it("isauthenticated is false", () => {
      assert.equal(context.isAuthenticated, false);
    });
  });
  describe("Context for GET /api/units/?{query parameters with full text search filter}", () => {

    beforeEach((done) => {
      req = getReq(`/units/?top=10&skip=4&sort=-abbrev name&pop=false&filter={"$text":{"$search":"\\"receta\\""}}`,
        "GET",
        { top: "10", skip: "4", sort: "-abbrev name", pop: "false", filter: `{"$text":{"$search":"\\"receta\\""}}` });
      res = new ResponseMock();
      context = new Context.RequestContext(req, res, defaultRequestContextOptions);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers were not set", () => {
      assert.equal(res.results.headerWasSet, false);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
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
      assert.equal(context.model.modelName, "Unit");
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
    it(`url is: /units/?top=10&skip=4&sort=-abbrev name&pop=false&filter={"$text":{"$search":"\\"receta\\""}}`, () => {
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
    it("user is null", () => {
      assert.equal(context.user, null);
    });
    it("isauthenticated is false", () => {
      assert.equal(context.isAuthenticated, false);
    });
  });
  describe("Context for POST /api/units", () => {

    beforeEach((done) => {
      req = getReq("/units/", "POST")
      res = new ResponseMock();
      context = new Context.RequestContext(req, res, defaultRequestContextOptions);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers were not set", () => {
      assert.equal(res.results.headerWasSet, false);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
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
      assert.equal(context.model.modelName, "Unit");
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
    it("user is null", () => {
      assert.equal(context.user, null);
    });
    it("isauthenticated is false", () => {
      assert.equal(context.isAuthenticated, false);
    });
  });
  describe("Context for POST /api/units With user data", () => {

    beforeEach((done) => {
      req = getReq("/units/", "POST", null, {
        rawData: {},
        id: "1",
        isAdmin: true
      })
      res = new ResponseMock();
      context = new Context.RequestContext(req, res, defaultRequestContextOptions);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers were not set", () => {
      assert.equal(res.results.headerWasSet, false);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
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
      assert.equal(context.model.modelName, "Unit");
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
    it("user is not null", () => {
      assert.notEqual(context.user, null);
    });
    it("isauthenticated is true", () => {
      assert.equal(context.isAuthenticated, true);
    });
  });
  describe("Context for PUT /api/units", () => {

    beforeEach((done) => {
      req = getReq("/units/", "PUT");
      res = new ResponseMock();
      context = new Context.RequestContext(req, res, defaultRequestContextOptions);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers were not set", () => {
      assert.equal(res.results.headerWasSet, false);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
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
      assert.equal(context.model.modelName, "Unit");
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
    it("user is null", () => {
      assert.equal(context.user, null);
    });
    it("isauthenticated is false", () => {
      assert.equal(context.isAuthenticated, false);
    });
  });
  describe("Context for PUT /api/units/{unit id}", () => {

    beforeEach((done) => {
      req = getReq("/units/5a1b55d8ee211d57141ec4fb", "PUT");
      res = new ResponseMock();
      context = new Context.RequestContext(req, res, defaultRequestContextOptions);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers were not set", () => {
      assert.equal(res.results.headerWasSet, false);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
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
      assert.equal(context.model.modelName, "Unit");
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
    it("user is null", () => {
      assert.equal(context.user, null);
    });
    it("isauthenticated is false", () => {
      assert.equal(context.isAuthenticated, false);
    });
  });
  describe("Context for DELETE /api/units/{unit id}", () => {

    beforeEach((done) => {
      req = getReq("/units/5a1b55d8ee211d57141ec4fb", "DELETE");
      res = new ResponseMock();
      context = new Context.RequestContext(req, res, defaultRequestContextOptions);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers were not set", () => {
      assert.equal(res.results.headerWasSet, false);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
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
      assert.equal(context.model.modelName, "Unit");
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
    it("user is null", () => {
      assert.equal(context.user, null);
    });
    it("isauthenticated is false", () => {
      assert.equal(context.isAuthenticated, false);
    });
  });
  describe("Context for {NOT ALLOWED METHOD} /api/units/", () => {

    beforeEach((done) => {
      req = getReq("/units/", "NOTALLOWEDMETHOD");
      res = new ResponseMock();
      context = new Context.RequestContext(req, res, defaultRequestContextOptions);
      done();
    })

    it("Request is valid (no errors found because in the options 'disableMethodCheck = true')", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers were not set", () => {
      assert.equal(res.results.headerWasSet, false);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
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
      assert.equal(context.model.modelName, "Unit");
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
    it("user is null", () => {
      assert.equal(context.user, null);
    });
    it("isauthenticated is false", () => {
      assert.equal(context.isAuthenticated, false);
    });
  });
});
describe("RequestContext (enabling Request Context Options)", () => {
  describe("Enabling CORS Headers", () => {

    beforeEach((done) => {
      req = getReq("/units/", "GET");
      res = new ResponseMock();
      let opt = new Context.RequestContextOptions(false, true, true, true);
      context = new Context.RequestContext(req, res, opt);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response Headers has been set", () => {
      assert.equal(res.results.headerWasSet, true);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
  });
  describe("Enabling Entity check for a valid entity", () => {

    beforeEach((done) => {
      req = getReq("/units/", "GET");
      res = new ResponseMock();
      let opt = new Context.RequestContextOptions(true, false, true, true);
      context = new Context.RequestContext(req, res, opt);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
  });
  describe("Enabling Entity check for an invalid entity", () => {

    beforeEach((done) => {
      req = getReq("/invalid-entity/", "GET");
      res = new ResponseMock();
      let opt = new Context.RequestContextOptions(true, false, true, true);
      context = new Context.RequestContext(req, res, opt);
      done();
    })

    it("Request is not valid", () => {
      assert.equal(context.isValidRequest, false);
    });
    it("Response was sent by the context, (error found)", () => {
      assert.equal(JSON.parse(res.results.responseWasSent).error != null, true);
    });
  });
  describe("Enabling Method check for a valid method", () => {

    beforeEach((done) => {
      req = getReq("/units/", "GET");
      res = new ResponseMock();
      let opt = new Context.RequestContextOptions(true, true, false, true);
      context = new Context.RequestContext(req, res, opt);
      done();
    })

    it("Request is valid (this means no errors found)", () => {
      assert.equal(context.isValidRequest, true);
    });
    it("Response wasn't sent by the context, (this means no errors found)", () => {
      assert.equal(res.results.responseWasSent, false);
    });
  });
  describe("Enabling Method check for an invalid method", () => {

    beforeEach((done) => {
      req = getReq("/units/", "INVALID-METHOD");
      res = new ResponseMock();
      let opt = new Context.RequestContextOptions(true, true, false, true);
      context = new Context.RequestContext(req, res, opt);
      done();
    })

    it("Request is not valid", () => {
      assert.equal(context.isValidRequest, false);
    });
    it("Response was sent by the context, (error found)", () => {
      assert.equal(JSON.parse(res.results.responseWasSent).error != null, true);
    });
  });
  describe("Enabling configured request delay for testing purposes", () => {

    beforeEach((done) => {
      req = getReq("/units/", "GET");
      res = new ResponseMock();
      let opt = new Context.RequestContextOptions(true, true, true, false);
      process.env.REQUESTS_ADDED_DELAY = "2" //We will set a custom delay of 2 sec.
      context = new Context.RequestContext(req, res, opt);
      
      //Sending response:
      context.sendResponse(null, { myData: "data" });

      done();
    })

    it("Response data not been sent immediately", () => {
      assert.equal(res.results.responseWasSent, false);
    });
    it("next() Middleware function was called after configured delay", (done) => {
      setTimeout(() => {
        assert.equal(JSON.parse(res.results.responseWasSent).payload != null, true);
        done();
      }, (Number(process.env.REQUESTS_ADDED_DELAY) * 1000) + 500);
    });
  });
});
