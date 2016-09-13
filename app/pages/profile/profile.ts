import {NavController} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {PreferencesPage} from '../preferences/preferences'
import {FirebaseService} from '../../components/firebaseService';

@Component({
  templateUrl: 'build/pages/profile/profile.html',
})
export class ProfilePage {

  user
  profile
  name
  image = { url: "img/default-avatar.jpg" }
  credits
  email

  constructor(public nav: NavController, public FBService: FirebaseService, private ngZone: NgZone) {




  }




  ngOnInit() {
    this.user = firebase.auth().currentUser;
    this.email = this.user.email;
    var ref = firebase.database().ref().child('users').child(this.user.uid);

    ref.on('value', (snapshot) => {
      this.ngZone.run(() => {
        this.profile = snapshot.val();
        this.name = this.profile.firstName + ' ' + this.profile.lastName;
        this.credits = this.profile.credits.balance;
      });
    })




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
