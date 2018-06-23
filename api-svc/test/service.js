//@ts-check

var assert = require("assert");
var sinon = require('sinon');
var entities = require("../entities");
var Service = require("../service");

describe("Service", () => {
  describe("update()", () => {

    var e = entities.getEntity("units");
    var svc = new Service(e);
    var stubModelUpdate;

    it("Should complete with a valid callback as parameter", (done) => {

      stubModelUpdate = sinon.stub(e.model, "update");
      svc.update(svc.getNewobjectId(), {}, () => {});

      setTimeout(() =>{ //Because we are testing over a promise:
        stubModelUpdate.restore();
        assert.ok(stubModelUpdate.called); 
        done()}, 10);
    });
    it("Shouldn't complete with a non valid callback as parameter", () => {

      stubModelUpdate = sinon.stub(e.model, "update");

      assert.throws(() => {
        svc.update("", {}, "invalid callback parameter");
      })

      stubModelUpdate.restore();
      assert.ok(stubModelUpdate.notCalled);
    });
  });
  describe("find()", () => {

    var e = entities.getEntity("units");
    var svc = new Service(e);
    var stubModelFind;

    function setStub() {
      return sinon.stub(e.model, "find")
        .onFirstCall()
        .returns({
          populate: function (arg) { return this; },
          skip: function (arg) { return this; },
          limit: function (arg) { return this; },
          sort: function (arg) { return this; },
          exec: function () { return this; },
        });
    }

    function setQuery(top, skip, sort, pop) {
      const ret = {
        top: "",
        skip: "",
        sort: "",
        pop: ""
      };

      if (top) {
        ret.top = top;
      }

      if (skip) {
        ret.skip = skip;
      }

      if (sort) {
        ret.sort = sort;

      }
      if (pop) {
        ret.pop = pop;
      }

      return ret;
    }

    it("Should complete with no parameters", () => {

      stubModelFind = setStub();
      svc.find("", setQuery(), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with all valid parameters", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("100", "0", "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with valid parameters and empty query object", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery(), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Shouldn't complete with valid parameters and a null query object", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a non valid callback as parameter", () => {

      stubModelFind = setStub();
      assert.throws(() => {
        svc.find("5a387f92ccbd71477022ea65", setQuery("100", "0", "my sort", ""), "invalid callback parameter");
      })
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a nor JSON or null conditions", () => {

      stubModelFind = setStub();
      //assert.throws(() => {
      svc.find("invalid conditions", setQuery("100", "0", "my sort", ""), () => { });
      //})
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a non string or number 'skip' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("100", new Object(), "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a non string or number 'top' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery(new Object(), "0", "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a string 'skip' parameter that is not a number", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("0", "not a number", "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a string 'top' parameter that is not a number", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("not a number", "0", "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a negative 'skip' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("100", "-1", "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a negative string 'top' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("-1", "0", "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a string 'top' parameter with value 0", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("0", "0", "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a not string type 'sort' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("0", "0", new Object(), ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Should complete with an empty string top and skip parameters", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("", "", "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with an empty string 'top' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("", "0", "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with an empty string 'skip' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("100", "", "my sort", ""), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Shouldn't complete with a not string type 'pop' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("0", "0", new Object(), 1), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a 'pop' parameter that is not 'true', 'false' or an empty string", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("0", "0", new Object(), "invalid parameter value"), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Should complete with a valid 'pop' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", setQuery("100", "", "my sort", "true"), () => { });
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
  });
  describe("delete()", () => {

    var e = entities.getEntity("units");
    var svc = new Service(e);
    var stubModelRemove;

    function setStub() {
      return sinon.stub(e.model, "remove");
    }

    it("Should complete with all valid parameters", () => {

      stubModelRemove = setStub();
      svc.delete("5a387f92ccbd71477022ea65", () => { });
      stubModelRemove.restore();

      assert.ok(stubModelRemove.called);
    });
    it("Shouldn't complete with a non valid callback as parameter", () => {

      stubModelRemove = setStub();
      assert.throws(() => {
        svc.delete("5a387f92ccbd71477022ea65", "invalid callback parameter");
      })
      stubModelRemove.restore();

      assert.ok(stubModelRemove.notCalled);
    });
    it("Shouldn't complete with a nor JSON or null conditions", () => {

      stubModelRemove = setStub();
      //assert.throws(() => {
      svc.delete("invalid conditions", () => { });
      //})
      stubModelRemove.restore();

      assert.ok(stubModelRemove.notCalled);
    });
  });
  describe("add()", () => {

    var e = entities.getEntity("units");
    var svc = new Service(e);
    var stubModelAdd;

    function setStub() {
      return sinon.stub(e.model, "hydrate")
        .onFirstCall()
        .returns({
          isNew: true,
          _id: "",
          save: function (callback) { return this; }
        });
    }
    it("Should complete with all valid parameters", (done) => {

      stubModelAdd = setStub();
      svc.add({ _id: "5a387f92ccbd71477022ea65" }, () => { });
      
      setTimeout(() =>{ //Because we are testing over a promise:
        stubModelAdd.restore();
        assert.ok(stubModelAdd.called); 
        done()}, 10);
    });
    it("Shouldn't complete with a non valid callback as parameter", () => {

      stubModelAdd = setStub();
      assert.throws(() => {
        svc.add({ _id: "5a387f92ccbd71477022ea65" }, "invalid callback parameter");
      })
      stubModelAdd.restore();

      assert.ok(stubModelAdd.notCalled);
    });
  });
});

