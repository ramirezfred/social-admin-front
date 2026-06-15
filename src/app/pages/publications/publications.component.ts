import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterConfig } from 'angular2-toaster';
import { NbSpinnerService, NbThemeService } from '@nebular/theme';

import { CatalogoComponent } from './components/catalogo/catalogo.component';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit {

  loading = false;

  count_publications = 0;
  selectedTab1 = true;   // Lista
  selectedTab2 = false;  // Crear
  selectedTab3 = false;  // Catalogo

  config: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-right',
    timeout: 3000,
    newestOnTop: true,
    tapToDismiss: true,
    preventDuplicates: false,
    animation: 'fade',
    limit: 5,
  });

  @ViewChild(CatalogoComponent) CatalogoC: CatalogoComponent;

  constructor(
    public nbspinnerservice:NbSpinnerService,
    public themeService:NbThemeService
  )
  {}

  ngOnInit() {

		//this.themeService.changeTheme('cosmic');
		this.themeService.changeTheme('default');

	}

  selectTab(tab: number): void {
    this.selectedTab1 = tab === 1;
    this.selectedTab2 = tab === 2;
    this.selectedTab3 = tab === 3;
    if(tab === 3){
      this.CatalogoC.initComponent();
    }
  }
}
