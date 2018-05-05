import { Component, OnInit } from '@angular/core';

import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-backend',
  templateUrl: './backend.component.html',
  styleUrls: ['./backend.component.css']
})
export class BackendComponent implements OnInit {

  route: string;

  constructor(location: Location, router: Router) {
    
    router.events.subscribe((val) => {
        this.route = location.path();
    });
  }

  ngOnInit() {
  }

}
