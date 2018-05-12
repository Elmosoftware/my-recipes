import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { BackendComponent } from "./backend/backend.component";
import { EntitiesComponent } from "./backend/entities/entities.component";

import { Unit } from "./model/unit";
import { NewRecipeComponent } from './new-recipe/new-recipe.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'new-recipe', component: NewRecipeComponent },
  { path: 'backend', component: BackendComponent, children:[
    { path: 'levels', component: EntitiesComponent, data: { type: "Level", title: "Niveles de dificultad" } },
    { path: 'mealtypes', component: EntitiesComponent, data: { type: "MealType", title: "Platos" } },
    { path: 'units', component: EntitiesComponent, data: { type: "Unit", title: "Unidades de medida" } },
    { path: 'ingredients', component: EntitiesComponent, data: { type: "Ingredient", title: "Ingredientes" } }
  ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
