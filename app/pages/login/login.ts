import {NavController, LoadingController, AlertController} from 'ionic-angular';
import {Component} from '@angular/core';
import {ForgotPage} from '../forgot/forgot'
import GlobalService = require('../../components/globalService');


@Component({
  templateUrl: 'build/pages/login/login.html',
})
export class LoginPage {

  username: string
  password: string

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController) {

  }

  login() {
    if (!this.username || this.username === '') {
      GlobalService.doAlert('Please enter your email.', this.alertCtrl);
      return;
    }
    if (!this.password || this.password === '') {
      GlobalService.doAlert('Please enter your password.', this.alertCtrl);
      return;
    }

    let loading = this.loadingCtrl.create({
      content: "Logging in...",
      duration: 1000
    });
    loading.present();

    var self = this;
    firebase.auth().signInWithEmailAndPassword(this.username, this.password)
    .then(function (data) {

    })
    .catch(function (error) {
      console.error(error);
      GlobalService.doAlert(error['message'], self.alertCtrl);
    });

  }

  forgot() {
    this.nav.push(ForgotPage);
  }

}
