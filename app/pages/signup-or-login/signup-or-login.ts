import {NavController} from 'ionic-angular';
import {Http} from '@angular/http';
import {LoginPage} from '../login/login';
import {SignupPage} from '../signup/signup';
import {Component} from '@angular/core';

@Component({
  templateUrl: 'build/pages/signup-or-login/signup-or-login.html',
})
export class SignupOrLoginPage {

  constructor(public nav: NavController, public http: Http) {

  }

  categoryGroups;

  ngOnInit() {

    let db = firebase.database().ref('groups');

    db.once('value', (snapshot) => {

      this.categoryGroups = snapshot.val();


    });

  }


  goToLogin() {
    this.nav.push(LoginPage);
  }

  goToSignup() {

    var user = firebase.auth().currentUser;

    if (user) {
      this.nav.push(SignupPage, {
        stepIndex: 6
      })
    } else {
      this.nav.push(SignupPage, {
        categoryGroups: this.categoryGroups
      });
    }

  }
}
