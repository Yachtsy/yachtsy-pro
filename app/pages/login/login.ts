import {NavController, LoadingController, AlertController} from 'ionic-angular';
import {Component} from '@angular/core';
import {ForgotPage} from '../forgot/forgot'
import {Keyboard} from 'ionic-native';
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

  ngOnInit() {
    let back_element = (<HTMLInputElement>document.querySelector('.login-page'));
    back_element.style.height = GlobalService.windowHeight + 'px';    
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
      content: "Logging in..."
    });
    loading.present();

    var self = this;
    firebase.auth().signInWithEmailAndPassword(this.username, this.password)
    .then(function (data) {
      loading.dismiss();
    })
    .catch(function (error) {
      console.error(error);
      loading.dismiss().then(() => {
        GlobalService.doAlert(error['message'], self.alertCtrl);
      });
    });

  }

  forgot() {
    if (Keyboard)
      Keyboard.close();
    
    this.nav.push(ForgotPage);
  }

}
