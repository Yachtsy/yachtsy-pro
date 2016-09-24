import {NavController, LoadingController, AlertController} from 'ionic-angular';
import {Component} from '@angular/core';
import GlobalService = require('../../components/globalService');


@Component({
  templateUrl: 'build/pages/forgot/forgot.html',
})
export class ForgotPage {

  username: string

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController) {

  }

  send() {
    if (!this.username || this.username === '') {
      GlobalService.doAlert('Please enter your email.', this.alertCtrl);
      return;
    }

    let loading = this.loadingCtrl.create({
      content: "Sending...",
      duration: 1000
    });
    loading.present();

    var self = this;
    firebase.auth().sendPasswordResetEmail(this.username)
    .then(function (data) {
      loading.dismiss().then(() => {
        GlobalService.doAlert('Your request have successfully sent, please check your email box.', self.alertCtrl);
        self.nav.pop();
      });
    })
    .catch(function (error) {
      console.error(error);
      loading.dismiss().then(() => {
        GlobalService.doAlert(error['message'], self.alertCtrl);
      });
    });

  }

}
