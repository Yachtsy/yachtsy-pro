import {NavController, NavParams, Tabs} from 'ionic-angular';
import {Component, ViewChild} from '@angular/core';

import {RequestsPage} from '../requests/requests';
import {QuotesPage} from '../quotes/quotes';
import {HiresPage} from '../hires/hires';
import {ProfilePage} from '../profile/profile';


@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {

  requestsPage;
  quotesPage;
  hiresPage;
  profilePage;

  nav;
  navParams;

  @ViewChild('myTabs') tabRef: Tabs;

  constructor(nav: NavController, navParams: NavParams) {

    console.log('tabs contructor');
    this.nav = nav;
    this.navParams = navParams;

    this.requestsPage = RequestsPage;
    this.quotesPage = QuotesPage;
    this.hiresPage = HiresPage;
    this.profilePage = ProfilePage;
    console.log('tabs contructor end');
  }

  ionViewWillEnter() {

    console.log('entering tabs page, nav params are:', this.navParams);

    var tabIndexSpecified = this.navParams.get('tabIndex');

    if (tabIndexSpecified !== undefined) {

      // quotes page
      if (tabIndexSpecified === 1) {

      } else {

      }

      this.tabRef.select(tabIndexSpecified);
    }

  }

}