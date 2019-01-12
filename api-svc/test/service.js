//@ts-check

var assert = require("assert");
var sinon = require('sinon');
var entities = require("../entities");
var Service = require("../service");

function setQuery(top, skip, sort, pop, count, filter, fields, pub, owner) {
  const ret = {
    top: "",
    skip: "",
    sort: "",
    pop: "",
    count: "",
    filter: "",
    fields: "",
    pub: "",
    owner: ""
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

  if (owner) {
    ret.owner = owner;
  }

  return ret;
}

function setUser(id, isAdmin) {
  return {
    rawData: {},
    id: id,
    isAdmin: isAdmin
  };
}

describe("Service", () => {
  //#region update() test

  describe("update()", () => {
    var e = entities.getEntity("units");
    var svc = new Service(e);
    var stubModelUpdate;

    it("Should complete with a valid callback as parameter", (done) => {

      stubModelUpdate = sinon.stub(e.model, "update");
      svc.update(svc.getNewobjectId(), {}, setUser(1, true), () => { });

      setTimeout(() => { //Because we are testing over a promise:
        stubModelUpdate.restore();
        assert.ok(stubModelUpdate.called);
        done()
      }, 10);
    });
    it("Shouldn't complete with a non valid callback as parameter", () => {

      stubModelUpdate = sinon.stub(e.model, "update");

      assert.throws(() => {
        //@ts-ignore
        svc.update(svc.getNewobjectId(), {}, setUser(1, true), "invalid callback parameter");
      })

      stubModelUpdate.restore();
      assert.ok(stubModelUpdate.notCalled);
    });
    it("Shouldn't complete when the user is not authenticated", (done) => {

      stubModelUpdate = sinon.stub(e.model, "update");

      svc.update(svc.getNewobjectId(), {}, null, (err, data) => {
        stubModelUpdate.restore();
        assert.ok(stubModelUpdate.notCalled);
        assert.equal(err.message, `-[ACCESS VIOLATION]: Entities of type "unit" can be created or updated ONLY by authenticated users granted as "ADMINISTRATORS".`);
        done();
      });
    });
    it("Shouldn't complete when if the user is not ADMIN and attempt to update an entity other than Ingredients or Recipes.", (done) => {

      stubModelUpdate = sinon.stub(e.model, "update");

      svc.update(svc.getNewobjectId(), {}, setUser(1, false), (err, data) => {
        stubModelUpdate.restore();
        assert.ok(stubModelUpdate.notCalled);
        assert.equal(err.message, `-[ACCESS VIOLATION]: Entities of type "unit" can be created or updated ONLY by authenticated users granted as "ADMINISTRATORS".`);
        done();
      });
    });
    it("Shouldn't complete if a hidden attribute is part of the document.", (done) => {

      stubModelUpdate = sinon.stub(e.model, "update");

      svc.update(svc.getNewobjectId(), { deletedOn: new Date() }, setUser(1, true), (err, data) => {
        stubModelUpdate.restore();
        assert.ok(stubModelUpdate.notCalled);
        assert.equal(err.message, `-At least one of the following attributes were found in the JSON filter: deletedOn. Those attributes are for internal use only, please remove them from the document and try again.`);
        done();
      });
    });
  });

  //#endregion

  //#region find() test
  describe("find()", () => {
    var e = entities.getEntity("recipes");
    var svc = new Service(e);
    var stubModelFind;

    function setStub(e = null) {

      if (!e) {
        e = entities.getEntity("recipes");
      }

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

    it("Should complete with no parameters", () => {

      stubModelFind = setStub();
      svc.find("", null, null, setQuery());
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with all valid parameters", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("100", "0", "my sort", ""));
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
      svc.find("5a387f92ccbd71477022ea65", null, null, null)
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
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("0", "0", "", "", "", new Object()))
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
    it("Shouldn't complete with a 'pub' parameter that has an invalid string value", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", "invalid-value"))
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
          {
            mealType: { $in: ["1", "2", "3"] },
            $or: [{ usedBy: "USER1" }, { estimatedTime: 30 }]
          }]
      }), null, setUser("1", false), setQuery("", "", "", "", "", "", "", "notpub"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]),
        `{"$and":[{"mealType":{"$in":["1","2","3"]},"$or":[{"usedBy":"USER1"},{"estimatedTime":30}]},{"$or":[{"lastUpdateBy":"1"},{"createdBy":"1"}]}],"publishedOn":{"$eq":null},"deletedOn":{"$eq":null}}`)
    });
    it("Should complete with a JSON filter, no user logged in and 'pub'=''", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
        $and: [
          {
            mealType: { $in: ["1", "2", "3"] },
            $or: [{ usedBy: "USER1" }, { estimatedTime: 30 }]
          }]
      }), null, null, setQuery("", "", "", "", "", "", "", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]), `{"$and":[{"mealType":{"$in":["1","2","3"]},"$or":[{"usedBy":"USER1"},{"estimatedTime":30}]}],"publishedOn":{"$ne":null},"deletedOn":{"$eq":null}}`)
    });
    it("Should complete with an Object ID as condition, no user logged in and 'pub'=''", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("", "", "", "", "", "", "", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]), `{"_id":"5a387f92ccbd71477022ea65","deletedOn":{"$eq":null},"publishedOn":{"$ne":null}}`);
    });
    it("Should complete with a valid 'owner' parameter (parameter value: '')", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", "", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with a valid 'owner' parameter (parameter value: 'me')", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", "", "me"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with a valid 'owner' parameter (parameter value: 'others')", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", "", "others"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Should complete with a valid 'owner' parameter (parameter value: 'any')", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", "", "any"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
    });
    it("Shouldn't complete with a 'owner' parameter that is not a string", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", "", 34))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a 'owner' parameter that has an invalid string value", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, setUser("1", false), setQuery("", "", "", "", "", "", "", "", "invalid-value"))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a 'owner' parameter with value 'me' when no user is logged", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("", "", "", "", "", "", "", "", "me"))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a 'owner' parameter with value 'others' when no user is logged", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("", "", "", "", "", "", "", "", "others"))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Should complete with a JSON filter without a '$and' condition in it a user logged in, 'pub'='all' and 'owner'='me'", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
        mealType: { $in: ["1", "2", "3"] },
        level: { $ne: "4" }
      }), null, setUser("1", false), setQuery("", "", "", "", "", "", "", "all", "me"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]),
        `{"mealType":{"$in":["1","2","3"]},"level":{"$ne":"4"},"$and":[{"$or":[{"lastUpdateBy":"1"},{"createdBy":"1"}]},{"$or":[{"lastUpdateBy":"1"},{"createdBy":"1"}]}],"deletedOn":{"$eq":null}}`)
    });
    it("Should complete with a JSON filter with a '$and' condition in it, a user logged in, 'pub'='all' and 'owner'='me'", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
        $and: [
          {
            mealType: { $in: ["1", "2", "3"] },
            $or: [{ __v: 0 }, { estimatedTime: 30 }]
          }],
        level: { $ne: "4" }
      }), null, setUser("1", false), setQuery("", "", "", "", "", "", "", "all", "me"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]),
        `{"$and":[{"mealType":{"$in":["1","2","3"]},"$or":[{"__v":0},{"estimatedTime":30}]},{"$or":[{"lastUpdateBy":"1"},{"createdBy":"1"}]},{"$or":[{"lastUpdateBy":"1"},{"createdBy":"1"}]}],"level":{"$ne":"4"},"deletedOn":{"$eq":null}}`);
    });
    it("Should complete with a JSON filter without a '$and' condition in it, a user logged in and 'owner'='others'", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
        mealType: { $in: ["1", "2", "3"] },
        level: { $ne: "4" }
      }), null, setUser("1", false), setQuery("", "", "", "", "", "", "", "all", "others"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]),
        `{"mealType":{"$in":["1","2","3"]},"level":{"$ne":"4"},"$and":[{"createdBy":{"$ne":"1"}},{"lastUpdateBy":{"$ne":"1"}},{"$or":[{"lastUpdateBy":"1"},{"createdBy":"1"}]}],"deletedOn":{"$eq":null}}`)
    });
    it("Should complete with a JSON filter with a '$and' condition in it, a user logged in, 'pub'='all' and 'owner'='others'", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
        $and: [
          {
            mealType: { $in: ["1", "2", "3"] },
            $or: [{ __v: 0 }, { estimatedTime: 30 }]
          }],
        level: { $ne: "4" }
      }), null, setUser("1", false), setQuery("", "", "", "", "", "", "", "all", "others"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]),
        `{"$and":[{"mealType":{"$in":["1","2","3"]},"$or":[{"__v":0},{"estimatedTime":30}]},{"createdBy":{"$ne":"1"}},{"lastUpdateBy":{"$ne":"1"}},{"$or":[{"lastUpdateBy":"1"},{"createdBy":"1"}]}],"level":{"$ne":"4"},"deletedOn":{"$eq":null}}`)
    });
    it("Should complete with a JSON filter without a '$and' condition in it, a user logged in, 'pub'='all' and 'owner'='any'", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
        mealType: { $in: ["1", "2", "3"] },
        level: { $ne: "4" }
      }), null, setUser("1", false), setQuery("", "", "", "", "", "", "", "all", "any"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]),
        `{"mealType":{"$in":["1","2","3"]},"level":{"$ne":"4"},"deletedOn":{"$eq":null},"$and":[{"$or":[{"lastUpdateBy":"1"},{"createdBy":"1"}]}]}`)
    });
    it("Should complete with a JSON filter with a '$and' condition in it, a user logged in 'pub'='all' and 'owner'='any'", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
        $and: [
          {
            mealType: { $in: ["1", "2", "3"] },
            $or: [{ __v: 0 }, { estimatedTime: 30 }]
          }],
        level: { $ne: "4" }
      }), null, setUser("1", false), setQuery("", "", "", "", "", "", "", "all", "any"));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]),
        `{"$and":[{"mealType":{"$in":["1","2","3"]},"$or":[{"__v":0},{"estimatedTime":30}]},{"$or":[{"lastUpdateBy":"1"},{"createdBy":"1"}]}],"level":{"$ne":"4"},"deletedOn":{"$eq":null}}`)
    });
    it("Should complete with an Object ID as condition, no user logged in and 'owner'=''", () => {

      stubModelFind = setStub();
      svc.find("5a387f92ccbd71477022ea65", null, null, setQuery("", "", "", "", "", "", "", "", ""));
      stubModelFind.restore();

      assert.ok(stubModelFind.called);
      assert.equal(JSON.stringify(stubModelFind.getCall(0).args[0]), `{"_id":"5a387f92ccbd71477022ea65","deletedOn":{"$eq":null},"publishedOn":{"$ne":null}}`);
    });
    it("Shouldn't complete with a JSON filter that includes the invalid attribute 'publishedOn'", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
        $and: [
          { mealType: { $in: ["1", "2", "3"] } },
          { publishedOn: { $eq: true } }
        ]
      }), null, null, setQuery("", "", "", "", "", "", "", "", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a JSON filter that includes the invalid attribute 'createdBy'", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
        $and: [
          { mealType: { $in: ["1", "2", "3"] } },
          { createdBy: { $eq: true } }
        ]
      }), null, null, setQuery("", "", "", "", "", "", "", "", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete with a JSON filter that includes the invalid attribute 'lastUpdateBy'", () => {

      stubModelFind = setStub();
      svc.find(JSON.stringify({
        $and: [
          { mealType: { $in: ["1", "2", "3"] } },
          { lastUpdateBy: { $eq: true } }
        ]
      }), null, null, setQuery("", "", "", "", "", "", "", "", ""))
        .catch((err) => {
        });
      stubModelFind.restore();

      assert.ok(stubModelFind.notCalled);
    });
    it("Shouldn't complete when requesting Not Published entities other than Recipes related without been granted as Admin.", (done) => {

      let e = entities.getEntity("units");
      let svc = new Service(e);

      stubModelFind = setStub(e);
      svc.find(JSON.stringify({ myProp: true }), null, setUser(1, false), setQuery("", "", "", "", "", "", "", "all", ""))
        .catch((err) => {
          stubModelFind.restore();
          assert.ok(stubModelFind.notCalled);
          assert.equal(err.message, `-[ACCESS VIOLATION]: Not published "unit" can be accessed ONLY by users granted as "ADMINISTRATORS".`);
          done();
        });
    });
  });
  //#endregion
  
  //#region delete() test
  describe("delete()", () => {  
    var e = entities.getEntity("units");
    var svc = new Service(e);
    var stubModelRemove;

    function setStub() {
      return sinon.stub(e.model, "update"); //The stub is for the "update" method since the inclusion of the "soft delete" feature.
    }

    it("Should complete with all valid parameters", () => {

      stubModelRemove = setStub();
      svc.delete("5a387f92ccbd71477022ea65", setUser(1, true), () => { });
      stubModelRemove.restore();

      assert.ok(stubModelRemove.called);
    });
    it("Shouldn't complete with a non valid callback as parameter", () => {

      stubModelRemove = setStub();
      assert.throws(() => {
        //@ts-ignore
        svc.delete("5a387f92ccbd71477022ea65", setUser(1, true), "invalid callback parameter");
      })
      stubModelRemove.restore();

      assert.ok(stubModelRemove.notCalled);
    });
    it("Shouldn't complete with a nor JSON or null conditions", () => {

      stubModelRemove = setStub();
      svc.delete("invalid conditions", setUser(1, true), () => { });
      stubModelRemove.restore();

      assert.ok(stubModelRemove.notCalled);
    });
    it("Shouldn't complete when the user is not authenticated", (done) => {

      stubModelRemove = setStub();

      svc.delete("5a387f92ccbd71477022ea65", null, (err, data) => {
        stubModelRemove.restore();
        assert.ok(stubModelRemove.notCalled);
        assert.equal(err.message, `-[ACCESS VIOLATION]: Entities of type "unit" can be deleted ONLY by authenticated users granted as "ADMINISTRATORS".`);
        done();
      });
    });
    it("Shouldn't complete if the user is not ADMIN and attempt to delete an entity other than Recipes.", (done) => {

      stubModelRemove = setStub();

      svc.delete("5a387f92ccbd71477022ea65", setUser(1, false), (err, data) => {
        stubModelRemove.restore();
        assert.ok(stubModelRemove.notCalled);
        assert.equal(err.message, `-[ACCESS VIOLATION]: Entities of type "unit" can be deleted ONLY by authenticated users granted as "ADMINISTRATORS".`);
        done();
      });
    });
  });
  //#endregion

  //#region add() test
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
      svc.add({ _id: "5a387f92ccbd71477022ea65" }, setUser(1, true), () => { });

      setTimeout(() => { //Because we are testing over a promise:
        stubModelAdd.restore();
        assert.ok(stubModelAdd.called);
        done()
      }, 10);
    });
    it("Shouldn't complete with a non valid callback as parameter", () => {

      stubModelAdd = setStub();
      assert.throws(() => {
        //@ts-ignore
        svc.add({ _id: "5a387f92ccbd71477022ea65" }, setUser(1, true), "invalid callback parameter");
      })
      stubModelAdd.restore();

      assert.ok(stubModelAdd.notCalled);
    });
    it("Shouldn't complete when the user is not authenticated", (done) => {

      stubModelAdd = setStub();

      svc.add({ _id: "5a387f92ccbd71477022ea65" }, null, (err, data) => {
        stubModelAdd.restore();
        assert.ok(stubModelAdd.notCalled);
        assert.equal(err.message, `-[ACCESS VIOLATION]: Entities of type "unit" can be created or updated ONLY by authenticated users granted as "ADMINISTRATORS".`);
        done();
      });
    });
    it("Shouldn't complete if the user is not ADMIN and attempt to add an entity other than Ingredients or Recipes.", (done) => {

      stubModelAdd = setStub();

      svc.update(svc.getNewobjectId(), {}, setUser(1, false), (err, data) => {
        stubModelAdd.restore();
        assert.ok(stubModelAdd.notCalled);
        assert.equal(err.message, `-[ACCESS VIOLATION]: Entities of type "unit" can be created or updated ONLY by authenticated users granted as "ADMINISTRATORS".`);
        done();
      });
    });
    it("Shouldn't complete if a hidden attribute is part of the document.", (done) => {

      stubModelAdd = setStub();

      svc.update(svc.getNewobjectId(), { deletedOn: new Date() }, setUser(1, true), (err, data) => {
        stubModelAdd.restore();
        assert.ok(stubModelAdd.notCalled);
        assert.equal(err.message, `-At least one of the following attributes were found in the JSON filter: deletedOn. Those attributes are for internal use only, please remove them from the document and try again.`);
        done();
      });
    });  
  });
  //#endregion
});

