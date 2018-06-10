/*
This is a clone of the "Angular 2 Wizard", (https://www.npmjs.com/package/angular2-wizard) created 
by Maiyaporn Phanich.
The reason why i cloned it this here instead of using the published versions is because some unresolved issues in v0.4.0 

Changes i'm doing:

Low Severity issues:
---------------------
-The form had an unwanted border (Status: FIXED): I'm getting rid of it by changing "card" CSS class in "wizard.component.css".
-Dropdowns can't scroll outside the form (Status: FIXED): I add the line overflow-y: visible; to the "card-block" class in "wizard.component.css".

High Severity issues:
---------------------
-The form allows to move to another step even if the current one has invalid data (Status: FIXED): This was working for the "Next" and "Previous" 
buttons, but not for the headers. This mean that you could move to a previous step, broke the data validation and come back to 
the next steps and continue working.
*/

import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WizardComponent } from './wizard.component';
import { WizardStepComponent } from './wizard-step.component';

export * from './wizard.component';
export * from './wizard-step.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    WizardComponent,
    WizardStepComponent
  ],
  exports: [
    WizardComponent,
    WizardStepComponent
  ]
})
export class WizardModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WizardModule
    };
  }
}
