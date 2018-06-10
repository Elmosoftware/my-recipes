#My Recipes site

For the website:

Main design using: https://v4-alpha.getbootstrap.com/examples/jumbotron/

Some real sites examples:

[Genius Kitchen](http://www.geniuskitchen.com/)
[Epicurious](https://www.epicurious.com/)
[All Recipes](http://allrecipes.com/)


##Home page

Top Navbar
    Logo (small), Site name, Main menu options (TBD).
    Menu options:
    -Nuevas recetas -> Jump to 2nd Jumbo
    -Categorias (llenar un menu con las categorias) -> Jump to página de visualización de recetas.
    -Administrar (Combo con opciones solo para administradores)
    -Busqueda -> Jump to 2nd Jumbo

1st Jumbo
    Site name, logo (big), carousel with photos
2nd Jumbo    
    Recently added
3rd Jumbo
    Search by ingredient. with a legend like "Do you like some particular ingredient in your meal today?, Search for it!"
Foot Navbar
    Social media links, About, Contact, Copyright legend.

------------------------------------------------s
Logos:

Sets:
https://www.flaticon.com/packs/kitchen-25
https://www.iconfinder.com/icons/753907/chefs_cook_food_hat_restaurant_icon#size=128

##Como agregar una nueva Entity

Cuando querramos agregar una nueva entity al Web Site y después de haberla agregado en la API, tenemos que:

1ro - Crear la clase de la entidad en src\app\Model, ver como referencia "unit.ts"
2do - Si la entidad se va a editar en el Backend, crear el cuadro de dialogo estándar para editar la entidad, (ver como ejemplo: src\app\standard-dialogs\edit-unit-dialog)
3ro - Si la entidad se va a editar en el Backend, editar el template de EntitiesComponent del backend, (src\app\backend\entities\entities.component.html) y agregar en el switch los encabezados de la tabla y binding de las columnas.
4to - Si la entidad se va a editar en el Backend, editar AppRoutingModule para agregar la ruta hija del Backend)
5to - Agregar la EntityDef de la entidad en EntityFactory. Ejemplo:

private entityDefs = {
        Unit: new EntityDef("units", EditUnitDialog, () => { return new Unit(); })
    };


---------------------------------------------------------
New Recipe Component design
===============================

The form will be divided in this steps:
1- Recipe
    name
    description
    estimatedTime
    level
    mealType
2- Ingredients
    ingredients
        recipeIngredient: 
            ingredient: Ingredient;
            amount: number;
            unit: Unit;
3- Steps
    directions
4- Saving
    Confirm an save the recipe.

------------------------------------------------------------

Component Cache
=================

class MySpecificComponentCache inherits ComponentCache:
--------------------------------------------------------

//Este método es el que se guarda como refreshCallback en el objeto "CacheItem":
refreshMyData(): Promise{
    //aca llamamos a lso servicios correspondientes y obtenemos la "data" a cachear:

    return Promise.Resolve(value)

}

class ComponentCache:
----------------------------
_pool: [CacheItem]  -> Array con los elementos del cache.
invalidate()
refresh()
destroy()
get(key)
add(item: cacheItem)
remove(key)

class CacheItem
---------------------------
key: string ->
duration: number -> Cuanto tiempo el item va a ser válido, (el tiempo es en segundos y se cuenta desde el                                           ultimo refresh).
lastRefresh: date ->
invalidate() -> 
isValid -> _isValid
value: any -> 
refreshCallback function() ->








