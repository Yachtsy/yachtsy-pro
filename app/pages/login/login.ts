import {NavController, LoadingController} from 'ionic-angular';
import {Component} from '@angular/core';

@Component({
  templateUrl: 'build/pages/login/login.html',
})
export class LoginPage {

  username: string
  constructor(public nav: NavController, private loadingCtrl: LoadingController) {

  }

  login() {

    let loading = this.loadingCtrl.create({
      content: "Logging in...",
      duration: 1000
    });
    loading.present();

    firebase.auth().signInWithEmailAndPassword(this.username, this.username).catch(function (error) {
      
      console.error(error);

    });

  }


}
