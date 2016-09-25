import {NavController} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {PreferencesPage} from '../preferences/preferences'
import {PurchaseCreditsPage} from '../purchase-credits/purchase-credits'
import {FirebaseService} from '../../components/firebaseService';
import {RatingComponentUpdateable} from '../../components/ratingsComponent';
import {SecurityContext, DomSanitizationService} from '@angular/platform-browser';
import {DebugPage} from '../debug/debug'


@Component({
  templateUrl: 'build/pages/profile/profile.html',
  directives: [RatingComponentUpdateable]
})
export class ProfilePage {

  user
  profile
  name
  credits
  email
  profileImage
  totalNumberOfReviews = 0
  score = 0

  constructor(
    public nav: NavController,
    private sanitizer: DomSanitizationService,
    public FBService: FirebaseService,
    private ngZone: NgZone) {

  }

  ngOnInit() {
    this.user = firebase.auth().currentUser;
    this.email = this.user.email;
    var ref = firebase.database().ref().child('users').child(this.user.uid);

    this.profileImage = this.getSafeURL('img/default-photo.png');

    ref.on('value', (snapshot) => {
      this.ngZone.run(() => {

        this.profile = snapshot.val();
        this.name = this.profile.firstName + ' ' + this.profile.lastName;
        this.credits = this.profile.credits.balance;

        if (typeof this.profile.profile.photo === 'string' && this.profile.profile.photo.length > 0) {
          var profileImage = this.profile.profile.photo;
          profileImage = profileImage.replace(/\r?\n|\r/g, '');
          this.profileImage = this.getSafeURL(profileImage);
        }

        this.calcReviews(this.profile.reviews);
      });
    })
  }

  calcReviews(reviews) {

    console.log('revies are:', reviews);
    if (reviews) {
      this.totalNumberOfReviews = Object.keys(reviews).length;

      let total = 0;

      Object.keys(reviews).map((reviewId) => {
        var review = reviews[reviewId];
        var rating = review.rating;
        total += rating;
      });

      this.score = total / this.totalNumberOfReviews
      console.log('the score is', this.score);
    }

  }

  logout() {
    firebase.auth().signOut().then(function () {
      console.log('user signed out');
    }, function (error) {
      console.error(error);
    });
  }

  getSafeURL(url) {
    var safe_url = this.sanitizer.bypassSecurityTrustStyle('url(' + url + ')');
    return safe_url;
  }

  categories = [];


  goToPreferences() {

    this.nav.push(PreferencesPage)

  }

  goToPurchaseCredits() {
    this.nav.push(PurchaseCreditsPage)
  }

  goToDebug() {
    this.nav.push(DebugPage, {profile: this.profile})
  }

  goToTravelPreferences() {

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
