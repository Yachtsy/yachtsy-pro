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
    constructor(
        public nav: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        private ngZone: NgZone,
        public fbserv: FirebaseService) {


    }

    ngOnInit() {

        

    }
    
}
