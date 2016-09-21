import {NavController} from 'ionic-angular';
import {TabsPage} from '../tabs/tabs'
import {Component} from '@angular/core';

@Component({
  templateUrl: 'build/pages/intro/intro.html'
})
export class IntroPage {

  nav

  constructor(nav: NavController) {
    this.nav = nav;
  }

  goToHome() {
    this.nav.setRoot(TabsPage);
  }
}