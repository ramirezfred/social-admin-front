import { Component, OnInit } from '@angular/core';
import { ToasterConfig } from 'angular2-toaster';
import { NbSpinnerService, NbThemeService } from '@nebular/theme';

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
  }
}
