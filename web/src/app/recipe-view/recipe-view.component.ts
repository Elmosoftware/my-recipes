import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrls: ['./recipe-view.component.css']
})
export class RecipeViewComponent implements OnInit {

  recipeId: string;
  
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.recipeId = this.route.snapshot.paramMap.get("id");
  }

}
