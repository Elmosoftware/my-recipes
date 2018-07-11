import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { SearchComponent } from './search/search.component';
import { EntitiesComponent } from "./entities/entities.component";
import { RecipeViewComponent } from "./recipe-view/recipe-view.component";
import { RecipeComponent } from './recipe/recipe.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'recipe', component: RecipeComponent },
  { path: 'recipe/:id', component: RecipeComponent },
  { path: 'recipe-view/:id', component: RecipeViewComponent },
  { path: 'levels', component: EntitiesComponent, data: { type: "Level", title: "Niveles de dificultad" } },
  { path: 'mealtypes', component: EntitiesComponent, data: { type: "MealType", title: "Platos" } },
  { path: 'units', component: EntitiesComponent, data: { type: "Unit", title: "Unidades de medida" } },
  { path: 'ingredients', component: EntitiesComponent, data: { type: "Ingredient", title: "Ingredientes" } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
