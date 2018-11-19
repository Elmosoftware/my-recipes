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
      svc.update(svc.getNewobjectId(), {}, null, () => { });

      setTimeout(() => { //Because we are testing over a promise:
        stubModelUpdate.restore();
        assert.ok(stubModelUpdate.called);
        done()
      }, 10);
    });
    it("Shouldn't complete with a non valid callback as parameter", () => {

      stubModelUpdate = sinon.stub(e.model, "update");

      assert.throws(() => {
        svc.update("", {}, null, "invalid callback parameter");
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

    function setQuery(top, skip, sort, pop, count, filter, fields, pub) {
      const ret = {
        top: "",
        skip: "",
        sort: "",
        pop: "",
        count: "",
        filter: "",
        fields: "",
        pub: ""
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

      if (count) {
        ret.count = count;
      }

      if (filter) {
        ret.filter = filter;
      }

      if (fields) {
        ret.fields = fields;
      }

      if (pub) {
        ret.pub = pub;
      }

      return ret;
    }

    function setUser(id, isAdmin){
      return { 
        rawData: {}, 
        id: id, 
        isAdmin: isAdmin 
      };
    }

    it("Should complete with no parameters", () => {

      stubModelFind = setStub();
      svc.find("", null,  null, setQuery());
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with all valid parameters", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null,  null, setQuery("100", "0", "my sort", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with valid parameters and empty query object", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery());
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Shouldn't complete with valid parameters and a null query object", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null)
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a nor JSON or null conditions", () => {

      stubModelFind = setStub();
      svc.find("invalid conditions", null, null, setQuery("100", "0", "my sort", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a non string or number 'skip' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("100", new Object(), "my sort", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a non string or number 'top' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery(new Object(), "0", "my sort", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a string 'skip' parameter that is not a number", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("0", "not a number", "my sort", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a string 'top' parameter that is not a number", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("not a number", "0", "my sort", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a negative 'skip' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("100", "-1", "my sort", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a negative string 'top' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("-1", "0", "my sort", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a string 'top' parameter with value 0", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("0", "0", "my sort", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a not string type 'sort' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("0", "0", new Object(), ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Should complete with an empty string top and skip parameters", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("", "", "my sort", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with an empty string 'top' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("", "0", "my sort", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with an empty string 'skip' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("100", "", "my sort", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Shouldn't complete with a not string type 'pop' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("0", "0", new Object(), 1))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a 'pop' parameter that is not 'true', 'false' or an empty string", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("0", "0", new Object(), "invalid parameter value"))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Should complete with a valid 'pop' parameter", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("100", "", "my sort", "true"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Shouldn't complete with a 'count' parameter that is not 'true', 'false' or an empty string", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("0", "0", "", "", new Object()))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a 'filter' parameter that is not a JSON Filter and neither an Object Id", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("0", "0", "", "", "",  new Object()))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a 'fields' parameter that is not a string", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("0", "0", "", "", "", "", new Object()))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Should complete with a valid 'pub' parameter (parameter value: '')", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with a valid 'pub' parameter (parameter value: 'default')", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", "default"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with a valid 'pub' parameter (parameter value: 'all')", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", "all"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with a valid 'pub' parameter (parameter value: 'notpub')", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", "notpub"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Shouldn't complete with a 'pub' parameter that is not a string", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", 34))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a 'pub' parameter with value 'all' when no user is logged", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("", "", "", "", "", "", "", "all"))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a 'pub' parameter with value 'notpub' when no user is logged", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("", "", "", "", "", "", "", "notpub"))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Should complete with a JSON filter, a user logged in and 'pub'='notpub'", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
          $and: [ 
            { mealType: { $in: ["1", "2", "3"] },
            $or: [ { createdBy: "USER1"}, { estimatedTime: 30} ] 
          }]
        }), null, setUser("1", false), setQuery("", "", "", "", "", "", "", "notpub"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]), `{"$and":[{"mealType":{"$in":["1","2","3"]},"$or":[{"createdBy":"USER1"},{"estimatedTime":30}]}],"publishedOn":{"$eq":null}}`)
    });
    it("Should complete with a JSON filter, no user logged in and 'pub'=''", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
          $and: [ 
            { mealType: { $in: ["1", "2", "3"] },
            $or: [ { createdBy: "USER1"}, { estimatedTime: 30} ] 
          }]
        }), null, null, setQuery("", "", "", "", "", "", "", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]), `{"$and":[{"mealType":{"$in":["1","2","3"]},"$or":[{"createdBy":"USER1"},{"estimatedTime":30}]}],"publishedOn":{"$ne":null}}`)
    });
    it("Should complete with an Object ID as condition, no user logged in and 'pub'=''", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("", "", "", "", "", "", "", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]), `{"_id":"5a387f92ccbd71477022ea65"}`);
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
      svc.delete("5a387f92ccbd71477022ea65", null, null, () => { });
      stubModelRemove.restore();

      assert.ok(stubModelRemove.called);
    });
    it("Shouldn't complete with a non valid callback as parameter", () => {

      stubModelRemove = setStub();
      assert.throws(() => {
        svc.delete("5a387f92ccbd71477022ea65", null, null, "invalid callback parameter");
      })
      stubModelRemove.restore();

      assert.ok(stubModelRemove.notCalled);
    });
    it("Shouldn't complete with a nor JSON or null conditions", () => {

      stubModelRemove = setStub();
      svc.delete("invalid conditions", null, null, () => { });
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
      svc.add({ _id: "5a387f92ccbd71477022ea65" }, null, () => { });

      setTimeout(() => { //Because we are testing over a promise:
        stubModelAdd.restore();
        assert.ok(stubModelAdd.called);
        done()
      }, 10);
    });
    it("Shouldn't complete with a non valid callback as parameter", () => {

      stubModelAdd = setStub();
      assert.throws(() => {
        svc.add({ _id: "5a387f92ccbd71477022ea65" }, null, "invalid callback parameter");
      })
      stubModelAdd.restore();

      assert.ok(stubModelAdd.notCalled);
    });
  });
});

