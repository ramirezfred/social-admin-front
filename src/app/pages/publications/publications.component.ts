import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterConfig } from 'angular2-toaster';
import { NbSpinnerService, NbThemeService } from '@nebular/theme';

import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { ListaComponent } from './components/lista/lista.component';

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
  @ViewChild(ListaComponent) ListaC: ListaComponent;

  // Variable para guardar temporalmente el ID
  idPublicacionParaEditar: any = null;

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

  //#region Editar publicaciones
  
  // 1. Cuando la lista pide editar
  onSolicitarEditar(id: any) {

    // setTimeout(()=>{
    //   /*
    //     ngOnChanges no se dispara si asignas el mismo valor 
    //     primitivo dos veces consecutivas (ej. clic en "editar" 
    //     sobre la misma publicación dos veces sin pasar por null), 
    //     así que si quieres soportar eso, resetea publicationToEdit = null 
    //     brevemente o usa un objeto/timestamp como trigger adicional
    //    */
    //   this.idPublicacionParaEditar = null; // Limpiamos el ID
    // },50);
    
    this.idPublicacionParaEditar = id;
    // Cambiamos el foco a la pestaña del formulario (app-crear)
    this.selectTab(1);
  }

  // 2. Cuando el formulario termina de actualizar
  onEdicionFinalizada() {
    this.idPublicacionParaEditar = null; // Limpiamos el ID
    // Opcional: regresar a la pestaña de la lista
    this.selectTab(2);

    this.ListaC.getEditada();
    
    // Aquí puedes disparar la recarga de app-lista si fuera necesario, 
    // aunque al cambiar de pestaña o por change detection suele actualizarse,
    // o bien si app-lista hace el fetch en el ngOnInit, al renderizarse de nuevo lo hará.
  }

  //#endregion
}
