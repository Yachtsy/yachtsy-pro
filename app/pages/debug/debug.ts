import {Component, NgZone} from '@angular/core';
import {Modal, NavController, NavParams, ModalController, LoadingController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {InAppPurchase} from 'ionic-native'

@Component({
    templateUrl: 'build/pages/debug/debug.html',
})
export class DebugPage {

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

        this.profile = this.navParams.get('profile');
        console.log('PROFILE -> ', this.profile);

        this.userId = firebase.auth().currentUser.uid;

    }



}
