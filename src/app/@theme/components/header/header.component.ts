import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { UserService } from '../../../@core/data/users.service';
import { AnalyticsService } from '../../../@core/utils/analytics.service';

// Mis imports
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { RutaBaseService } from '../../../services/ruta-base/ruta-base.service';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { SocialApiService } from '../../../services/social/api/api.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  //----Alertas---<
  config: ToasterConfig;

  positionAlert = 'toast-top-right';
  animationType = 'fade';
  title = 'HI there!';
  content = `I'm cool toaster!`;
  timeout = 5000;
  toastsLimit = 5;
  type = 'default'; // 'default', 'info', 'success', 'warning', 'error'

  isNewestOnTop = true;
  isHideOnClick = true;
  isDuplicatesPrevented = false;
  isCloseButton = true;
  //----Alertas--->

  @Input() position = 'normal';

  user = { name: '', picture: 'assets/images/user.png' };

  /*userMenu = [{ title: 'Profile' }, { title: 'Log out' }];*/
   userMenu = [{ title: 'Log out' }];
   menu = [{ title: 'Profile' }, { title: 'Log out' }];

   items = [{ title: 'Profile' }, { title: 'Log out' }];

   public data:any;

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private userService: UserService,
              private analyticsService: AnalyticsService,
              private router: Router,
              private http: HttpClient,
              private rutaService: RutaBaseService,
              private toasterService: ToasterService,
              private api_serv: SocialApiService,
  ) {

    
  }

  ngOnInit() {
    /*this.userService.getUsers()
      .subscribe((users: any) => this.user = users.nick);*/

      this.user.name = localStorage.getItem('mouvers_user_nombre');

  }

  ngOnDestroy() {
  }

  /*newAlert() {
    this.showToastPermanente('info', 'Info!', 'Persistente');
   }
   newAlert2() {
    this.showToast('info', 'Info!', 'Timeout');
   }*/

  private showToast(type: string, title: string, body: string) {
      this.config = new ToasterConfig({
        positionClass: this.position,
        timeout: this.timeout,
        newestOnTop: this.isNewestOnTop,
        tapToDismiss: this.isHideOnClick,
        preventDuplicates: this.isDuplicatesPrevented,
        animation: this.animationType,
        limit: this.toastsLimit,
      });
      const toast: Toast = {
        type: type,
        title: title,
        body: body,
        timeout: this.timeout,
        showCloseButton: this.isCloseButton,
        bodyOutputType: BodyOutputType.TrustedHtml,
      };
      this.toasterService.popAsync(toast);
  }

  private showToastPermanente(type: string, title: string, body: string) {
      this.config = new ToasterConfig({
        positionClass: this.position,
        timeout: 0, /*persistente*/
        newestOnTop: this.isNewestOnTop,
        tapToDismiss: this.isHideOnClick,
        preventDuplicates: this.isDuplicatesPrevented,
        animation: this.animationType,
        limit: 20,
      });
      const toast: Toast = {
        type: type,
        title: title,
        body: body,
        timeout: 0,
        showCloseButton: this.isCloseButton,
        bodyOutputType: BodyOutputType.TrustedHtml,
      };
      this.toasterService.popAsync(toast);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
  }

  toggleSettings(): boolean {
    this.sidebarService.toggle(false, 'settings-sidebar');
    return false;
  }

  goToHome() {
    //this.menuService.navigateHome();
    this.router.navigateByUrl('/pages');
  }

  startSearch() {
    this.analyticsService.trackEvent('startSearch');
  }

  onMenuClick($event){
    if ($event.title == 'Log out') {
      this.salir();
    }
    
  }

  salir() {
    // this.sesion_serv.resetSesion();
    this.api_serv.resetToken();
    this.router.navigateByUrl('/pagessimples/loginf');
  }



}
