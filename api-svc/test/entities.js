//@ts-check

var assert = require("assert");
var entities = require("../entities")

describe("Entities", () => {
  describe("exists()", () => {
    it("Should return 'true' for the entity 'units'", () => {
      assert.equal(entities.exists("units"), true);
    });
    it("Should return 'true' for the entity 'ingredients'", () => {
      assert.equal(entities.exists("ingredients"), true);
    });
    it("Should return 'true' for the entity 'levels'", () => {
      assert.equal(entities.exists("levels"), true);
    });
    it("Should return 'true' for the entity 'mealtypes'", () => {
      assert.equal(entities.exists("mealtypes"), true);
    });
    it("Should return 'true' for the entity 'recipes'", () => {
      assert.equal(entities.exists("recipes"), true);
    });
    it("Should return 'true' for the entity 'recipeingredients'", () => {
      assert.equal(entities.exists("recipeingredients"), true);
    });
    it("Should return 'false' for the entity 'unknownEntity'", () => {
      assert.equal(entities.exists("unknownEntity"), false);
    });
  });

  describe("getEntity()", () => {
    it("Shouldn't throw when requesting entity 'units'", () => {
      assert.ok(entities.getEntity("units"));
    });
    it("Shouldn't throw when requesting entity 'ingredients'", () => {
      assert.ok(entities.getEntity("ingredients"));
    });
    it("Shouldn't throw when requesting entity 'levels'", () => {
      assert.ok(entities.getEntity("levels"));
    });
    it("Shouldn't throw when requesting entity 'mealtypes'", () => {
      assert.ok(entities.getEntity("mealtypes"));
    });
    it("Shouldn't throw when requesting entity 'recipes'", () => {
      assert.ok(entities.getEntity("recipes"));
    });
    it("Shouldn't throw when requesting entity 'recipeingredients'", () => {
      assert.ok(entities.getEntity("recipeingredients"));
    });
    it("Should throw when requesting entity 'unknownEntity'", () => {
      assert.throws(() => {
        entities.getEntity("unknownEntity")
        })
    });
  });
});

