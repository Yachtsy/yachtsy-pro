import {Component, ViewChild} from '@angular/core';
import {ionicBootstrap, Platform, Loading} from 'ionic-angular';
import {MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {IntroPage} from './pages/intro/intro';
import {TabsPage} from './pages/tabs/tabs';
import {SignupOrLoginPage} from './pages/signup-or-login/signup-or-login';
import {CreateProfilePage} from './pages/create-profile/create-profile';
import {SignupPage} from './pages/signup/signup';
import {NgZone} from '@angular/core';
import {disableDeprecatedForms, provideForms} from '@angular/forms';
import {FirebaseService} from './components/firebaseService'

@Component({
  templateUrl: 'build/app.html',
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  // determine the first page based on whether the user is logged in.
  rootPage: any
  pages: Array<{ title: string, component: any }>;
  goneToProfileCreate = false;

  constructor(
    private platform: Platform,
    private menu: MenuController,
    private ngZone: NgZone
  ) {

    this.initializeApp();
  }

  start() {

    console.log('checking user...');
    var user = firebase.auth().currentUser;
    
    if (user) {

      console.log('checking user profile...');
      firebase.database().ref('users/' + user.uid)
        .once('value').then((snapshot) => {


          console.log('the user is ', user.uid);

          if (snapshot.exists()) {

            var userData = snapshot.val();
            console.log('user', userData);

            if (userData.emailVerified && userData.profile) {
              console.log('going to tabs page now');
              this.ngZone.run(() => {
                this.nav.setRoot(TabsPage, {}, { animate: true, direction: 'forward' })
              });
            } else if (!userData.emailVerified) {
              console.log('user email not verified');
              this.nav.setRoot(SignupPage, {
                stepIndex: 6
              });
            } else if (userData.emailVerified && !userData.profile) {

              console.log('directing user to profile creation');

              firebase.database().ref('supplierProfileCreate').once('value',
                (snapshot) => {
                  if (snapshot.exists()) {
                    this.nav.setRoot(CreateProfilePage, {
                      pages: snapshot.val().pages,
                      formPageIndex: 0,
                      answers: {}
                    }, { animate: true, direction: 'forward' });
                  }
                });
            }


          } else {
            console.log('NO USER PROFILE - logging user out');
            //firebase.auth().signOut();
            //this.nav.setRoot(SignupOrLoginPage);
          }
        })
    } else {
      console.log('going to sign up or login page')
      //this.nav.setRoot(SignupOrLoginPage);
    }
  }


  listenForAuthChanges(){

    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        console.log('no user so setting login page');
        this.ngZone.run(() => {
          this.nav.setRoot(SignupOrLoginPage);
        });
      } else {
        this.start();
      }
    });

  }


  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      
      this.listenForAuthChanges();
      this.start();
    });
  }

}


var config = {
  prodMode: false,
  backButtonText: '',
};

ionicBootstrap(MyApp, [disableDeprecatedForms(), provideForms(), FirebaseService], config);