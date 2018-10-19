import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { SearchComponent } from './search/search.component';
import { EntitiesComponent } from "./entities/entities.component";
import { RecipeViewComponent } from "./recipe-view/recipe-view.component";
import { RecipeComponent } from './recipe/recipe.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { AuthGuard } from "./services/auth-guard";
import { UnauthorizedErrorPageComponent } from './error-pages/unauthorized/unauthorized.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'error-unauthorized', component: UnauthorizedErrorPageComponent },
  { path: 'search', component: SearchComponent },
  { path: 'recipe', component: RecipeComponent, canActivate: [ AuthGuard ] },
  { path: 'recipe/:id', component: RecipeComponent, canActivate: [ AuthGuard ] },
  { path: 'recipe-view/:id', component: RecipeViewComponent },
  { path: 'levels', component: EntitiesComponent, data: { type: "Level", title: "Niveles de dificultad", authGuard: { adminOnly: true }}, canActivate: [ AuthGuard ] },
  { path: 'mealtypes', component: EntitiesComponent, data: { type: "MealType", title: "Platos", authGuard: { adminOnly: true }}, canActivate: [ AuthGuard ] },
  { path: 'units', component: EntitiesComponent, data: { type: "Unit", title: "Unidades de medida", authGuard: { adminOnly: true }}, canActivate: [ AuthGuard ] },
  { path: 'ingredients', component: EntitiesComponent, data: { type: "Ingredient", title: "Ingredientes", authGuard: { adminOnly: true }}, canActivate: [ AuthGuard ] },
  { path: 'user-preferences', component: UserPreferencesComponent, data: { authGuard: { adminOnly: true }}, canActivate: [ AuthGuard ] }
  // { path: 'user-preferences', component: UserPreferencesComponent, data: { authGuard: { adminOnly: true }}, canActivate: [ AuthGuard ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
