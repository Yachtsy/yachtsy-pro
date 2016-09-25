import {Component, NgZone} from '@angular/core';
import {Modal, NavController, NavParams, ModalController, LoadingController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {InAppPurchase} from 'ionic-native'

@Component({
    templateUrl: 'build/pages/travel-preferences/travel-preferences.html',
})
export class TravelPreferencesPage {

    profile
    userId

    travelPref
    place

    distancePrefs = [
        { value: 20, text: "Up to 20 miles" },
        { value: 50, text: "Up to 50 miles" },
        { value: 75, text: "Up to 75 miles" },
        { value: 100, text: "Up to 100 miles" },
        { value: 999999999, text: "More than 100 miles" }
    ];

    constructor(
        public nav: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        private ngZone: NgZone,
        public fbserv: FirebaseService) {


    }

    ngOnInit() {

        this.profile = this.navParams.get('profile');
        console.log('PROFILE -> ', this.profile);
        this.travelPref = this.profile.locationInfo.distance;
        this.place = this.profile.locationInfo.placeName;

    }

    save() {
        console.log('new travel pref =', this.travelPref);
    }

}
