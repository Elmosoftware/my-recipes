#My Recipes API design documentation

class *Level*
    Name:
        type: String
        desc: Name of the Level.
        req: true
        unique: true
        note: So far the following levels will be added:
            - Beginner
            - Intermediate
            - Expert
    Description:
        type: String
        desc: Level Description.
end class

enum *MealType*
     Name:
        type: String
        desc: Name of the meal type.
        req: true
        unique: true
        note: Composed by the following:
            - Appetizer
            - Breakfast
            - MainDish
            - Dessert
    Description:
        type: String
        desc: Level Description.
end enum

class *UnitOfMeasure*
    Abbrev:
        type: String
        req: true
        unique: true
        desc: Acronym or short name, like: "l" for litres, "cm3" for cubic centimeters, teaspoon, etc.
    Name:
        type: String
        req: true
        desc: like: "Litres", "Cubic centimeters", etc.
end class

class *Ingredient*
    Name: 
        type: String
        desc: Name of the ingredient
        req: true
        unique: true
    CompatibleUnits:
        type: UnitOfMeasure[]
        req: true, at least one Unit must be added.
end class

class *Recipe*
    Name: 
        type: String
        desc: Name of the recipe
        req: true
        unique: true
    Description: 
        type: String
        desc: A no more than 2 lines dish description like "An easy to cook version of the marinade sausage that our kids will love".
    EstimatedTime: 
        type: Number
        desc: Total preparation time Stored in minutes. 
    Level:
        type: Level
        desc: Represent the skill level required for this preparation.
    MealType:
        type: MealType
        desc: The type of meal this recipe is.
    Ingredients: 
        type: RecipeIngredient[]
        desc: List of ingredientes and amount of each one as other details.
    Directions:
        type: String[]
        desc: The set of directions required to prepare the recipe.
end class

class *RecipeIngredient*
    Recipe:
        type: Recipe
        desc: The recipe in which this ingredient take part.
        req: true
    Ingredient:
        type: Ingredient
        req: true
        unique: true for this recipe.
    Amount:
        type: Number
        req: true
    Unit:
        type: UnitOfMeasure
        req: true
end class


Ver modelado many to many in Mongo DB acá: http://learnmongodbthehardway.com/schema/schemabasics/

-------------------------------------------------------
Normal HTTP Status codes:

200 OK - Response to a successful GET, PUT, PATCH or DELETE. Can also be used for a POST that doesn't result in a creation.
201 Created - Response to a POST that results in a creation. Should be combined with a Location header pointing to the location of the new resource
204 No Content - Response to a successful request that won't be returning a body (like a DELETE request)

400 Bad Request - The request is malformed, such as if the body does not parse
401 Unauthorized - When no or invalid authentication details are provided. Also useful to trigger an auth popup if the API is used from a browser
403 Forbidden - When authentication succeeded but authenticated user doesn't have access to the resource
404 Not Found - When a non-existent resource is requested
405 Method Not Allowed - When an HTTP method is being requested that isn't allowed for the authenticated user
410 Gone - Indicates that the resource at this end point is no longer available. Useful as a blanket response for old API versions
415 Unsupported Media Type - If incorrect content type was provided as part of the request
422 Unprocessable Entity - Used for validation errors
429 Too Many Requests - When a request is rejected due to rate limiting

500 Internal Server Error

-------------------------------------------------------------------
API Actions
GET /items - Retrieves a full list of items.
GET /items/:id - Retrieves a specific item.
GET /items/{filter condition} - Retrieves the items that match the specified condition.
GET /items/{filter condition}/?{query parameters} - Retrieves the items that match the specified condition and applying pagination, sorting, etc, as defined in the query parameters.


POST /items - Creates a new item.
PUT /items/:id - Updates a specific item.
DELETE /items/:id - Deletes a specific item.

------------------------------------------------------------

Possible URLs:
            /model/
            /model/{ID or JSON filter}
            /model/?{query parameters}
            /model/{ID or JSON filter}?{query parameters}


Sample routes for Filtering:
GET /api/units/{ "name": { "$in": [ "U7", "U8" ] } }
GET /api/units/{ "$and": [ { "abbrev": "UNIT07" }, { "name": "U7" } ] }
GET /api/units/{ "$or" : [ { "abbrev": "UNIT07" }, { "abbrev": "UNIT12" } ] }
GET /api/units/{ "$and" : [ { "$or" : [ { "abbrev": "UNIT07" } ] },  { "$or" : [ { "abbrev": "UNIT12" } ] } ] }

Query param details:
top: Will be always number or empty
skip: Will be always number or empty
pop: Boolean indcating if subdocuments will be populated.
sort: String with the following format: FieldName1 {asc|desc} [, FieldName2 {asc|desc}] 
    e.g:   
        "name"  <- indicates to sort by name ascending, ("asc" is the default value).
        "name, createdOn desc" <- Sorting by field "name" ascending and then by field "createdOn" descending. 



-------------------------------------------------------------------------------------------------------------
Test recipes:
=====================================================================

{
	"name": "My 1st Recipe",
	"description": "This is my recipe description",
	"estimatedTime": "30",
	"level": "5aae9c17d096af48709a21de",
	"mealType": "5ac8a92597c9bf375c2fff3f",
	"ingredients": [
		{
			"ingredient": "5aae9717cadcc74b1455a4da",
			"amount": "3",
			"unit": "5a1b572526fa5818f8a82536"
		}
		],
	"directions" : ["Primero hacer esto.", "Luego hacer lo otro.", "Y al final lastrarlo."]
} 

{
	"name": "My 2nd Recipe",
	"description": "This is my recipe description",
	"estimatedTime": "30",
	"level": "5aae9bf7d096af48709a21dd",
	"mealType": "5ac8a94097c9bf375c2fff40",
	"ingredients": [
		{
			"ingredient": "5acc343e71d8618538bfa242",
			"amount": "3",
			"unit": "5a43f45f9ff96867941dfde5"
		}
		],
	"directions" : ["2nd Primero hacer esto.", "2nd Luego hacer lo otro.", "2nd Y al final lastrarlo."]
} 

{
	"name": "My 3rd Recipe",
	"description": "This is my recipe description",
	"estimatedTime": "30",
	"level": "5aae9c17d096af48709a21de",
	"mealType": "5ac8a90e97c9bf375c2fff3e",
	"ingredients": [
		{
			"ingredient": "5ad37964a790ea6b089d3724",
			"amount": "3",
			"unit": "5a43f4809ff96867941dfde9"
		}
		],
	"directions" : ["3rd Primero hacer esto.", "3rd Luego hacer lo otro.", "3rd Y al final lastrarlo."]
} 

{
	"name": "My 4th Recipe",
	"description": "This is my recipe description",
	"estimatedTime": "30",
	"level": "5ac6ebf32303413084121f3d",
	"mealType": "5ac8a90e97c9bf375c2fff3e",
	"ingredients": [
		{
			"ingredient": "5ac27c982b7d8b42887ab37b",
			"amount": "3",
			"unit": "5a1b55d8ee211d57141ec4fb"
		}
		],
	"directions" : ["4th Primero hacer esto.", "4th Luego hacer lo otro.", "4th Y al final lastrarlo."]
} 


