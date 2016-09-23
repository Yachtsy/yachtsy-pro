import {NavController} from 'ionic-angular';
import {Http} from '@angular/http';
import {LoginPage} from '../login/login';
import {GetStartedPage} from '../get-started/get-started';
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

    this.nav.push(SignupPage, {
      categoryGroups: this.categoryGroups,
      stepIndex: 1
    });

  }
}
