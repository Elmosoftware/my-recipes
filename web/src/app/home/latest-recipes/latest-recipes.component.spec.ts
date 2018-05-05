import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestRecipesComponent } from './latest-recipes.component';

describe('LatestRecipesComponent', () => {
  let component: LatestRecipesComponent;
  let fixture: ComponentFixture<LatestRecipesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LatestRecipesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
