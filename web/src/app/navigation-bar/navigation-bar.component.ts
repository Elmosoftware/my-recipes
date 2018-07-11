import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent implements OnInit {

  searchTerm: string;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.searchTerm = "";
  }

  search(){
    this.router.navigate(["/search"], { queryParams: { term: this.searchTerm } } )
  }
}
