import {NavController, ModalController, Modal} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {QuoteDetailPage} from '../quote-detail/quote-detail';
import {FirebaseService} from '../../components/firebaseService';
import GlobalService = require('../../components/globalService');


@Component({
  templateUrl: 'build/pages/hires/hires.html',
  providers: [FirebaseService]

})
export class HiresPage {

  constructor(
    public nav: NavController,
    public modalCtrl: ModalController,
    public fbserv: FirebaseService,
    private ngZone: NgZone) {

  }

  db
  user
  requests

  clearRequest($event, request) {
    request.cleared = true;
    $event.stopPropagation()
    console.log($event);
    console.log('clear requests', request);
    this.fbserv.clearRequest(request.id);
  }


  ngOnInit() {
    this.user = firebase.auth().currentUser;
    this.requests = GlobalService.matchedHires;
  }

  click(item) {
    console.log('hire clicked', item);

    let modal = this.modalCtrl.create(QuoteDetailPage, { requestId: item.id, isHired: true });
    modal.present();

    // this.nav.push(MessagesPage, {
    //   requestId: item.id,
    //   userId: item.uid
    // });

  }

}
