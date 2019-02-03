//Angular and 3rd party
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule, MatDialogRef, MatAutocompleteModule, MatInputModule} from '@angular/material';
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { NgxSelectModule } from "ngx-select-ex";
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { NgProgressModule, NgProgressInterceptor } from 'ngx-progressbar';

//Support Classes and Modules
import { CustomErrorHandler } from "./custom-error-handler";
import { InfiniteScrollingModule } from "./shared/infinite-scrolling/infinite-scrolling-module";

//Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { EntitiesComponent } from './entities/entities.component';
import { LatestRecipesComponent } from './home/latest-recipes/latest-recipes.component';
import { RecipeComponent } from "./recipe/recipe.component";
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { WizardModule } from "./shared/wizard/wizard.module";
import { RecipeViewComponent } from './recipe-view/recipe-view.component';
import { SearchComponent } from './search/search.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { UnauthorizedErrorPageComponent } from './error-pages/unauthorized/unauthorized.component';
import { NotFoundErrorPageComponent } from "./error-pages/not-found/not-found.component";
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { CarouselComponent } from './shared/carousel/carousel.component';

//Services
import { SubscriptionService } from "./services/subscription.service";
import { EntityServiceFactory } from "./services/entity-service-factory";
import { StandardDialogService } from "./standard-dialogs/standard-dialog.service";
import { Cache } from "./shared/cache/cache";
import { ToasterHelperService } from "./services/toaster-helper-service";
import { AuthService } from "./services/auth-service";
import { AuthGuard } from './services/auth-guard';
import { MediaService } from "./services/media-service";

//Dialogs
import { ConfirmDialogComponent } from './standard-dialogs/confirm-dialog/confirm-dialog.component'
import { EditMealTypeDialog } from "./standard-dialogs/edit-mealtype-dialog/edit-mealtype-dialog";
import { EditLevelDialog } from './standard-dialogs/edit-level-dialog/edit-level-dialog';
import { EditUnitDialog } from './standard-dialogs/edit-unit-dialog/edit-unit-dialog';
import { EditIngredientDialog } from "./standard-dialogs/edit-ingredient-dialog/edit-ingredient-dialog";
import { EditRecipeDirectionDialog } from "./standard-dialogs/edit-recipe-direction-dialog/edit-recipe-direction-dialog";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    EntitiesComponent,
    ConfirmDialogComponent,
    EditUnitDialog,
    EditLevelDialog,
    EditMealTypeDialog,
    EditIngredientDialog,
    EditRecipeDirectionDialog,
    LatestRecipesComponent,
    RecipeComponent,
    NavigationBarComponent,
    RecipeViewComponent,
    SearchBoxComponent,
    AuthCallbackComponent,
    UserPreferencesComponent,
    UnauthorizedErrorPageComponent,
    NotFoundErrorPageComponent,
    MyRecipesComponent,
    CarouselComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatInputModule,
    MatAutocompleteModule,
    HttpClientModule,
    ToastrModule.forRoot({
      maxOpened: 5,
      closeButton: true,
      positionClass: "toast-top-right",
      timeOut: 5000
    }),
    NgxSelectModule,
    NgxPageScrollModule,
    WizardModule,
    HttpClientModule,
    NgProgressModule,
    InfiniteScrollingModule
  ],
  entryComponents: [
    ConfirmDialogComponent,
    EditUnitDialog,
    EditLevelDialog,
    EditMealTypeDialog,
    EditIngredientDialog,
    EditRecipeDirectionDialog
  ],
  providers: [
    AuthService,
    AuthGuard,
    { provide: ErrorHandler, useClass: CustomErrorHandler },
    EntityServiceFactory,
    SubscriptionService,
    StandardDialogService,
    Cache,
    ToasterHelperService,
    { provide: HTTP_INTERCEPTORS, useClass: NgProgressInterceptor, multi: true },
    MediaService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
