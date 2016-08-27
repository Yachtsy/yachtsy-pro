import {NavController} from 'ionic-angular';
import {Component} from '@angular/core';
import {PreferencesPage} from '../preferences/preferences'

@Component({
  templateUrl: 'build/pages/profile/profile.html',
})
export class ProfilePage {

  user = firebase.auth().currentUser

  constructor(public nav: NavController) {

  }

  profile

  ngOnInit() {

   
  }

  logout() {
    firebase.auth().signOut().then(function () {
      console.log('user signed out');
    }, function (error) {
      console.error(error);
    });
  }

  categories = [];


  goToPreferences() {

    this.nav.push(PreferencesPage)

  }

  delete() {


    // var user = firebase.auth().currentUser;
    // var userId = user.uid;

    // // TODO - USE PASSWORDS OPTIONALLY

    // user.reauthenticate(user.email).catch(function (error) {
    //   // Handle Errors here.
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   // ...
    //   console.error(error);

    //   user.delete().then(function () {
    //     console.log('user was deleted');
    //     firebase.database().ref('users/' + userId).remove()
    //       .then(() => {
    //         console.log('user profile was deleted');
    //       }).catch(() => {
    //         console.log('user profile was deleted');
    //       });
    //   }, function (error) {
    //     // An error happened.
    //     console.error(error);
    //   });


    // });


  }

}
