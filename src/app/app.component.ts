/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';

//Mis imports
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { PublicationService } from './services/publications/publication.service'; // Ajusta la ruta

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(private analytics:AnalyticsService,
  			 private router: Router,
			 private route: ActivatedRoute,
			 private http: HttpClient,
      private publicationService: PublicationService) {
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();

    // this.loadExternalScript("https://www.paypalobjects.com/api/checkout.js");

  }

  // private loadExternalScript(scriptUrl: string) {
  //   return new Promise((resolve, reject) => {
  //     const scriptElement = document.createElement('script')
  //     scriptElement.src = scriptUrl
  //     scriptElement.onload = resolve
  //     document.body.appendChild(scriptElement)
  //   })
  // }

  
}
