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
import { MyRecipesComponent } from './my-recipes/my-recipes.component';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full' 
  },
  { 
    path: 'home', 
    component: HomeComponent 
  },
  { 
    path: 'auth-callback', 
    component: AuthCallbackComponent 
  },
  { 
    path: 'error-unauthorized', 
    component: UnauthorizedErrorPageComponent 
  },
  { 
    path: 'search', 
    component: SearchComponent 
  },
  { 
    path: 'recipe', 
    component: RecipeComponent, 
    data: { 
      authGuard: { 
        adminOnly: false, 
        allowSocialUsers: true 
      } 
    }, 
    canActivate: [AuthGuard] },
  { 
    path: 'recipe/:id', 
    component: RecipeComponent, 
    data: { 
      authGuard: { 
        adminOnly: false, 
        allowSocialUsers: true 
      }
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'recipe-view/:id', 
    component: RecipeViewComponent 
  },
  { 
    path: 'levels', 
    component: EntitiesComponent, 
    data: { 
      type: "Level", 
      title: "Niveles de dificultad", 
      authGuard: { 
        adminOnly: true, 
        allowSocialUsers: true 
      }
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'mealtypes', 
    component: EntitiesComponent, 
    data: { 
      type: "MealType", 
      title: "Platos", 
      authGuard: { 
        adminOnly: true, 
        allowSocialUsers: true 
      } 
    }, 
    canActivate: [AuthGuard] },
  { 
    path: 'units', 
    component: EntitiesComponent, 
    data: { 
      type: "Unit", 
      title: "Unidades de medida", 
      authGuard: { 
        adminOnly: true, 
        allowSocialUsers: true 
      } 
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'ingredients', 
    component: EntitiesComponent, 
    data: { 
      type: "Ingredient", 
      title: "Ingredientes", 
      authGuard: { 
        adminOnly: true, 
        allowSocialUsers: true 
      } 
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'user-preferences', 
    component: UserPreferencesComponent, 
    data: { 
      authGuard: { 
        adminOnly: false, 
        allowSocialUsers: false 
      } 
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'my-recipes', 
    component: MyRecipesComponent, 
    data: { 
      authGuard: { 
        adminOnly: false, 
        allowSocialUsers: true 
      } 
    }, 
    canActivate: [AuthGuard] 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
