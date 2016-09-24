import {NavController, NavParams, LoadingController, AlertController} from 'ionic-angular';
import {Component} from '@angular/core';
import {SignupPage} from '../signup/signup';
import GlobalService = require('../../components/globalService');


@Component({
  templateUrl: 'build/pages/get-started/get-started.html',
})
export class GetStartedPage {

  categoryGroups
  categoryGroupKeys
  selectedItem

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private loadingCtrl: LoadingController) {

  }

  ngOnInit() {
    this.categoryGroups = this.navParams.get('categoryGroups');
    if (this.categoryGroups) {
      this.categoryGroupKeys = Object.keys(this.categoryGroups).filter((groupKey) => {
        return this.categoryGroups[groupKey].enabled;
      });
    }
  }

  done() {
    if (!this.selectedItem) {
      GlobalService.doAlert('Please select your service.', this.alertCtrl);
      return;
    }

    var user = firebase.auth().currentUser;

    if (user) {
      this.nav.push(SignupPage, {
        stepIndex: 6
      })
    } else {
      this.nav.push(SignupPage, {
        stepIndex: 1,
        categoryGroups: this.categoryGroups,
        answers: {
          'CategoryGroup': this.selectedItem
        }
      });
    }

  }


}
